import 'server-only'
import { prisma } from './prisma'
import { notify, wonEmail, endingSoonEmail } from './notify'
import { sendMail } from './mail'
import { captureWinner, releaseAllHolds } from './balance'
import { ENDING_SOON_MINUTES } from './config'
import { logger } from './logger'

// Закрывает все лоты, у которых истёк срок торгов:
// назначает победителя (если были ставки) и рассылает уведомления.
export async function closeExpiredLots(): Promise<number> {
  const now = new Date()
  const expired = await prisma.lot.findMany({
    where: { status: 'ACTIVE', endsAt: { lte: now } },
    select: { id: true, title: true },
  })
  if (expired.length === 0) return 0

  let closed = 0
  for (const lot of expired) {
    const settled = await settleLot(lot.id)
    if (settled) closed++
  }
  return closed
}

// Закрывает один конкретный лот, если его время истекло.
// Возвращает true, если статус был изменён.
export async function settleLot(lotId: string): Promise<boolean> {
  const result = await prisma.$transaction(async (tx) => {
    const lot = await tx.lot.findUnique({ where: { id: lotId } })
    if (!lot || lot.status !== 'ACTIVE') return null
    if (lot.endsAt.getTime() > Date.now()) return null

    const topBid = await tx.bid.findFirst({
      where: { lotId },
      orderBy: { amount: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    if (topBid) {
      await tx.lot.update({
        where: { id: lotId },
        data: { status: 'SOLD', winnerId: topBid.userId, currentPrice: topBid.amount },
      })
      // Списываем средства победителя из заморозки, освобождаем проигравших.
      await captureWinner(tx, lotId, topBid.userId, topBid.amount, lot.currency)
      await notify({
        tx,
        userId: topBid.userId,
        type: 'won',
        title: 'Вы выиграли лот',
        body: `Лот «${lot.title}» продан вам за ${topBid.amount.toLocaleString('ru-RU')}.`,
        lotId,
      })
      return {
        winnerEmail: topBid.user.email,
        title: lot.title,
        price: topBid.amount,
      }
    }

    await tx.lot.update({ where: { id: lotId }, data: { status: 'ENDED' } })
    // Торги без ставок/победителя — освобождаем все заморозки.
    await releaseAllHolds(tx, lotId)
    return null
  })

  // Письмо победителю — после коммита транзакции.
  if (result) {
    await sendMail({
      to: result.winnerEmail,
      subject: 'Поздравляем с победой на торгах — IGNIS',
      html: wonEmail(result.title, lotId, result.price),
      text: `Вы выиграли лот «${result.title}» за ${result.price} Br.`,
    })
  }
  return true
}

// Рассылает подписчикам избранного письмо «лот скоро завершится».
// Каждый лот уведомляется однократно (флаг endingSoonNotified).
// Возвращает число отправленных писем.
export async function notifyEndingSoon(): Promise<number> {
  const now = Date.now()
  const threshold = new Date(now + ENDING_SOON_MINUTES * 60 * 1000)

  const lots = await prisma.lot.findMany({
    where: {
      status: 'ACTIVE',
      endingSoonNotified: false,
      endsAt: { lte: threshold, gt: new Date(now) },
    },
    select: {
      id: true,
      title: true,
      currentPrice: true,
      endsAt: true,
      watchers: {
        select: { user: { select: { id: true, email: true } } },
      },
    },
  })

  let sent = 0
  for (const lot of lots) {
    const minutesLeft = Math.max(
      1,
      Math.round((lot.endsAt.getTime() - Date.now()) / 60000),
    )

    for (const w of lot.watchers) {
      try {
        await notify({
          userId: w.user.id,
          type: 'ended',
          title: 'Лот из избранного скоро завершится',
          body: `Торги по лоту «${lot.title}» завершатся примерно через ${minutesLeft} мин.`,
          lotId: lot.id,
        })
        await sendMail({
          to: w.user.email,
          subject: 'Лот из избранного скоро завершится — IGNIS',
          html: endingSoonEmail(
            lot.title,
            lot.id,
            lot.currentPrice,
            minutesLeft,
          ),
          text: `Лот «${lot.title}» завершится через ${minutesLeft} мин.`,
        })
        sent++
      } catch (e) {
        logger.error('endingSoon email failed', e, {
          lotId: lot.id,
          userId: w.user.id,
        })
      }
    }

    await prisma.lot.update({
      where: { id: lot.id },
      data: { endingSoonNotified: true },
    })
  }

  return sent
}

// Ленивое закрытие: вызывается из публичных запросов, но не чаще раза в 15 секунд,
// чтобы не нагружать БД на каждый запрос между прогонами cron.
let lastRun = 0
export async function lazyCloseExpiredLots(): Promise<void> {
  const now = Date.now()
  if (now - lastRun < 15000) return
  lastRun = now
  try {
    await closeExpiredLots()
  } catch (e) {
    logger.error('lifecycle lazyClose error', e)
  }
}
