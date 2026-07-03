'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/security'
import { notify, outbidEmail } from '@/lib/notify'
import { sendMail } from '@/lib/mail'
import {
  ANTISNIPE_EXTEND_SEC,
  ANTISNIPE_WINDOW_SEC,
  RATE_LIMITS,
  REQUIRE_EMAIL_VERIFICATION,
} from '@/lib/config'

export type BidState = { error?: string; success?: string }

export async function placeBidAction(
  _prev: BidState,
  formData: FormData,
): Promise<BidState> {
  const g = await guard('bid', RATE_LIMITS.bid.limit, RATE_LIMITS.bid.windowSec)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) {
    return { error: 'Войдите в аккаунт, чтобы участвовать в торгах' }
  }

  // Требование подтверждённого email для участия.
  if (REQUIRE_EMAIL_VERIFICATION) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { emailVerified: true },
    })
    if (!user?.emailVerified) {
      return {
        error:
          'Подтвердите email, чтобы делать ставки. Ссылка отправлена вам на почту.',
      }
    }
  }

  const lotId = String(formData.get('lotId') ?? '')
  const amount = Number(formData.get('amount') ?? 0)
  if (!lotId || !Number.isFinite(amount) || amount <= 0) {
    return { error: 'Некорректная ставка' }
  }

  let outbid: { userId: string; email: string; title: string; price: number } | null =
    null

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

      // Предыдущий лидер (для уведомления о перебитой ставке).
      const prevTop = await tx.bid.findFirst({
        where: { lotId },
        orderBy: { amount: 'desc' },
        include: { user: { select: { id: true, email: true } } },
      })

      await tx.bid.create({
        data: { lotId, userId: session.userId, amount },
      })

      const soldNow = lot.buyNowPrice != null && amount >= lot.buyNowPrice

      // Антиснайпинг: продлеваем торги, если ставка в конце окна.
      const msLeft = lot.endsAt.getTime() - Date.now()
      let newEndsAt = lot.endsAt
      if (!soldNow && msLeft <= ANTISNIPE_WINDOW_SEC * 1000) {
        newEndsAt = new Date(Date.now() + ANTISNIPE_EXTEND_SEC * 1000)
      }

      await tx.lot.update({
        where: { id: lotId },
        data: {
          currentPrice: amount,
          endsAt: soldNow ? new Date() : newEndsAt,
          ...(soldNow ? { status: 'SOLD', winnerId: session.userId } : {}),
        },
      })

      // Уведомление предыдущему лидеру (если это другой человек).
      if (prevTop && prevTop.userId !== session.userId) {
        await notify({
          tx,
          userId: prevTop.userId,
          type: 'outbid',
          title: 'Вашу ставку перебили',
          body: `По лоту «${lot.title}» новая цена ${amount.toLocaleString('ru-RU')} Br.`,
          lotId,
        })
        outbid = {
          userId: prevTop.userId,
          email: prevTop.user.email,
          title: lot.title,
          price: amount,
        }
      }
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Не удалось сделать ставку' }
  }

  // Письмо о перебитой ставке — после коммита транзакции.
  if (outbid) {
    const o = outbid as { email: string; title: string; price: number }
    await sendMail({
      to: o.email,
      subject: 'Вашу ставку перебили — IGNIS',
      html: outbidEmail(o.title, lotId, o.price),
      text: `По лоту «${o.title}» новая цена ${o.price} Br.`,
    })
  }

  revalidatePath(`/auctions/${lotId}`)
  revalidatePath('/auctions')
  revalidatePath('/account')
  return { success: 'Ставка принята' }
}
