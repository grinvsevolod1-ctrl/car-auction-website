'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/security'
import { resolveAutoBids } from '@/lib/autobid'
import { RATE_LIMITS, REQUIRE_EMAIL_VERIFICATION } from '@/lib/config'
import { logger } from '@/lib/logger'

export type AutoBidState = { error?: string; success?: string }

export async function setAutoBidAction(
  _prev: AutoBidState,
  formData: FormData,
): Promise<AutoBidState> {
  const g = await guard('bid', RATE_LIMITS.bid.limit, RATE_LIMITS.bid.windowSec)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) return { error: 'Войдите, чтобы включить автоставку' }

  if (REQUIRE_EMAIL_VERIFICATION) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { emailVerified: true },
    })
    if (!user?.emailVerified) {
      return { error: 'Подтвердите email, чтобы включить автоставку' }
    }
  }

  const lotId = String(formData.get('lotId') ?? '')
  const maxAmount = Number(formData.get('maxAmount') ?? 0)
  if (!lotId || !Number.isFinite(maxAmount) || maxAmount <= 0) {
    return { error: 'Укажите корректный максимум' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const lot = await tx.lot.findUnique({ where: { id: lotId } })
      if (!lot) throw new Error('Лот не найден')
      if (lot.status !== 'ACTIVE' || lot.endsAt.getTime() <= Date.now()) {
        throw new Error('Торги по лоту не идут')
      }
      const minMax = lot.currentPrice + lot.bidStep
      if (maxAmount < minMax) {
        throw new Error(
          `Максимум должен быть не меньше ${minMax.toLocaleString('ru-RU')} Br`,
        )
      }

      await tx.autoBid.upsert({
        where: { userId_lotId: { userId: session.userId, lotId } },
        create: { userId: session.userId, lotId, maxAmount, active: true },
        update: { maxAmount, active: true },
      })

      await resolveAutoBids(tx, lotId)
    })
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : 'Не удалось включить автоставку',
    }
  }

  logger.info('autobid.set', { lotId, maxAmount })
  revalidatePath(`/auctions/${lotId}`)
  return { success: 'Автоставка включена' }
}

export async function cancelAutoBidAction(
  _prev: AutoBidState,
  formData: FormData,
): Promise<AutoBidState> {
  const session = await getSession()
  if (!session) return { error: 'Войдите в аккаунт' }

  const lotId = String(formData.get('lotId') ?? '')
  if (!lotId) return { error: 'Лот не указан' }

  await prisma.autoBid.updateMany({
    where: { userId: session.userId, lotId },
    data: { active: false },
  })

  revalidatePath(`/auctions/${lotId}`)
  return { success: 'Автоставка отключена' }
}
