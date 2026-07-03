import 'server-only'
import { prisma } from './prisma'
import { notify, wonEmail } from './notify'
import { sendMail } from './mail'

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
      await notify({
        tx,
        userId: topBid.userId,
        type: 'won',
        title: 'Вы выиграли лот',
        body: `Лот «${lot.title}» продан вам за ${topBid.amount.toLocaleString('ru-RU')} Br.`,
        lotId,
      })
      return {
        winnerEmail: topBid.user.email,
        title: lot.title,
        price: topBid.amount,
      }
    }

    await tx.lot.update({ where: { id: lotId }, data: { status: 'ENDED' } })
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
    console.error('[lifecycle] lazyClose error:', e)
  }
}
