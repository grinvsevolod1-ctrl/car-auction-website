'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin } from '@/lib/security'

export type WatchState = { watching?: boolean; error?: string }

export async function toggleWatchAction(
  _prev: WatchState,
  formData: FormData,
): Promise<WatchState> {
  const session = await getSession()
  if (!session) return { error: 'Войдите, чтобы добавить в избранное' }

  try {
    await assertSameOrigin()
  } catch {
    return { error: 'Ошибка безопасности запроса' }
  }

  const lotId = String(formData.get('lotId') ?? '')
  if (!lotId) return { error: 'Лот не указан' }

  const existing = await prisma.watchlist.findUnique({
    where: { userId_lotId: { userId: session.userId, lotId } },
  })

  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } })
    revalidatePath('/account/watchlist')
    revalidatePath(`/auctions/${lotId}`)
    return { watching: false }
  }

  await prisma.watchlist.create({ data: { userId: session.userId, lotId } })
  revalidatePath('/account/watchlist')
  revalidatePath(`/auctions/${lotId}`)
  return { watching: true }
}
