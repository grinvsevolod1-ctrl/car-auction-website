'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export type BidState = { error?: string; success?: string }

export async function placeBidAction(
  _prev: BidState,
  formData: FormData,
): Promise<BidState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Войдите в аккаунт, чтобы участвовать в торгах' }
  }

  const lotId = String(formData.get('lotId') ?? '')
  const amount = Number(formData.get('amount') ?? 0)
  if (!lotId || !Number.isFinite(amount) || amount <= 0) {
    return { error: 'Некорректная ставка' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const lot = await tx.lot.findUnique({ where: { id: lotId } })
      if (!lot) throw new Error('Лот не найден')
      if (lot.status !== 'ACTIVE') throw new Error('Торги по лоту не идут')
      if (lot.endsAt.getTime() <= Date.now()) {
        throw new Error('Торги по этому лоту завершены')
      }

      const minBid = lot.currentPrice + lot.bidStep
      if (amount < minBid) {
        throw new Error(
          `Минимальная ставка — ${minBid.toLocaleString('ru-RU')} Br`,
        )
      }

      await tx.bid.create({
        data: { lotId, userId: session.userId, amount },
      })

      const soldNow =
        lot.buyNowPrice != null && amount >= lot.buyNowPrice

      await tx.lot.update({
        where: { id: lotId },
        data: {
          currentPrice: amount,
          ...(soldNow
            ? { status: 'SOLD', winnerId: session.userId, endsAt: new Date() }
            : {}),
        },
      })
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Не удалось сделать ставку' }
  }

  revalidatePath(`/auctions/${lotId}`)
  revalidatePath('/auctions')
  revalidatePath('/account')
  return { success: 'Ставка принята' }
}
