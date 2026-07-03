import { prisma } from '@/lib/prisma'
import { notify } from '@/lib/notify'
import { logger } from '@/lib/logger'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

/**
 * Разрешает «войну» автоставок (proxy bidding) по лоту до стабильного
 * состояния. Побеждает автоставка с наибольшим maxAmount; цена
 * поднимается до (второй максимум + шаг), но не выше maxAmount лидера.
 *
 * Вызывается внутри уже открытой транзакции после каждой ставки/автоставки.
 * Возвращает список пользователей, чьи автоставки были исчерпаны (перебиты),
 * чтобы вызывающий код отправил им уведомления после коммита.
 */
export async function resolveAutoBids(
  tx: Tx,
  lotId: string,
): Promise<{ exhaustedUserIds: string[] }> {
  const exhausted = new Set<string>()

  // Ограничиваем число итераций на всякий случай.
  for (let i = 0; i < 50; i++) {
    const lot = await tx.lot.findUnique({ where: { id: lotId } })
    if (!lot || lot.status !== 'ACTIVE') break

    // Активные автоставки, способные поднять цену выше текущей.
    const autos = await tx.autoBid.findMany({
      where: { lotId, active: true, maxAmount: { gte: lot.currentPrice } },
      orderBy: [{ maxAmount: 'desc' }, { updatedAt: 'asc' }],
    })
    if (autos.length === 0) break

    const leader = autos[0]
    const currentTopBid = await tx.bid.findFirst({
      where: { lotId },
      orderBy: [{ amount: 'desc' }, { createdAt: 'desc' }],
    })

    // Если лидер по автоставке уже держит верхнюю ставку — стабильно.
    if (currentTopBid && currentTopBid.userId === leader.userId) break

    const runnerUp = autos.find((a) => a.userId !== leader.userId)
    // Целевая цена: перебить второго участника минимальным шагом.
    const contender = Math.max(
      lot.currentPrice,
      runnerUp?.maxAmount ?? lot.currentPrice,
    )
    let target = contender + lot.bidStep
    if (target > leader.maxAmount) target = leader.maxAmount

    // Нельзя поставить не выше текущей цены.
    if (target <= lot.currentPrice) {
      // Лидер не может перебить (например, его максимум = текущей цене).
      break
    }

    await tx.bid.create({
      data: { lotId, userId: leader.userId, amount: target },
    })
    await tx.lot.update({
      where: { id: lotId },
      data: { currentPrice: target },
    })

    // Тот, кого перебили этой автоставкой.
    if (currentTopBid && currentTopBid.userId !== leader.userId) {
      exhausted.add(currentTopBid.userId)
    }
    // Автоставки, полностью исчерпанные новой ценой, деактивируем.
    for (const a of autos) {
      if (a.userId !== leader.userId && a.maxAmount <= target) {
        exhausted.add(a.userId)
      }
    }
  }

  // Убираем из «перебитых» тех, кто на самом деле сейчас лидирует.
  const finalTop = await tx.bid.findFirst({
    where: { lotId },
    orderBy: [{ amount: 'desc' }, { createdAt: 'desc' }],
  })
  if (finalTop) exhausted.delete(finalTop.userId)

  const exhaustedUserIds = [...exhausted]

  // In-app уведомления об исчерпании автоставки.
  for (const userId of exhaustedUserIds) {
    await notify({
      tx,
      userId,
      type: 'outbid',
      title: 'Автоставка исчерпана',
      body: 'Ваш максимум по автоставке перебит. Повысьте лимит, чтобы вернуться в лидеры.',
      lotId,
    })
  }

  if (exhaustedUserIds.length) {
    logger.info('autobid.exhausted', { lotId, count: exhaustedUserIds.length })
  }

  return { exhaustedUserIds }
}
