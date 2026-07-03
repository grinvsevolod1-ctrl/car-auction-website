'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { guard, assertSameOrigin } from '@/lib/security'
import { getSettingNumber } from '@/lib/settings'
import { isCryptoAsset } from '@/lib/money'

export type DepositState = {
  error?: string
  success?: string
  reference?: string
  redirectUrl?: string
  walletAddress?: string
  walletNetwork?: string
  cryptoAmount?: string
  cryptoAsset?: string
}

function makeReference() {
  return 'IGN-' + randomBytes(4).toString('hex').toUpperCase()
}

const schema = z.object({
  method: z.enum(['ERIP', 'CRYPTO']),
  amount: z.number().int().positive('Введите сумму больше нуля').max(10_000_000),
  asset: z.string().trim().optional(),
  network: z.string().trim().optional(),
})

// Создаёт заявку на пополнение. ЕРИП => ссылка по кругу (round-robin).
// Крипта => криптокошелёк выбранной монеты + сумма к переводу.
export async function createDepositAction(
  _prev: DepositState,
  formData: FormData,
): Promise<DepositState> {
  const g = await guard('deposit', 10, 300)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) return { error: 'Требуется вход' }

  const parsed = schema.safeParse({
    method: String(formData.get('method') ?? ''),
    amount: Number(formData.get('amount') ?? 0),
    asset: String(formData.get('asset') ?? '') || undefined,
    network: String(formData.get('network') ?? '') || undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные' }
  }
  const { method, amount, asset, network } = parsed.data
  const reference = makeReference()

  if (method === 'ERIP') {
    // ЕРИП пополняет рублёвый баланс (BYN).
    const link = await prisma.paymentLink.findFirst({
      where: { active: true },
      orderBy: [{ lastUsedAt: { sort: 'asc', nulls: 'first' } }, { sortOrder: 'asc' }],
    })
    if (!link) {
      return {
        error:
          'Оплата через ЕРИП временно недоступна. Обратитесь к оператору.',
      }
    }
    await prisma.$transaction([
      prisma.paymentLink.update({
        where: { id: link.id },
        data: { timesUsed: { increment: 1 }, lastUsedAt: new Date() },
      }),
      prisma.depositRequest.create({
        data: {
          userId: session.userId,
          method: 'ERIP',
          currency: 'BYN',
          amount,
          reference,
          paymentLinkId: link.id,
        },
      }),
    ])
    revalidatePath('/account/balance')
    return {
      success:
        'Заявка создана. Оплатите по открывшейся ссылке и укажите код заявки.',
      reference,
      redirectUrl: link.url,
    }
  }

  // CRYPTO пополняет валютный баланс (USD/USDT).
  if (!asset || !isCryptoAsset(asset)) {
    return { error: 'Выберите криптовалюту' }
  }
  const wallet = await prisma.cryptoWallet.findFirst({
    where: {
      active: true,
      asset,
      ...(network ? { network } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }],
  })
  if (!wallet) {
    return {
      error: `Кошелёк ${asset}${network ? ' (' + network + ')' : ''} недоступен. Обратитесь к оператору.`,
    }
  }

  // Для стейблкоинов сумма перевода = сумме пополнения USDT.
  const stable = asset === 'USDT' || asset === 'USDC'
  const usdToByn = await getSettingNumber('usd_to_byn')
  const cryptoAmount = stable ? String(amount) : ''
  const rate = stable ? '1' : String(usdToByn)

  await prisma.depositRequest.create({
    data: {
      userId: session.userId,
      method: 'CRYPTO',
      currency: 'USD',
      amount,
      reference,
      walletId: wallet.id,
      cryptoAsset: asset,
      cryptoAmount: cryptoAmount || null,
      rate,
    },
  })
  revalidatePath('/account/balance')
  return {
    success: 'Заявка создана. Переведите средства на указанный адрес.',
    reference,
    walletAddress: wallet.address,
    walletNetwork: wallet.network,
    cryptoAmount: cryptoAmount || `эквивалент ${amount} USDT`,
    cryptoAsset: asset,
  }
}

// Пользователь прикрепляет хэш транзакции / комментарий к заявке.
export async function attachDepositProofAction(
  formData: FormData,
): Promise<void> {
  await assertSameOrigin()
  const session = await getSession()
  if (!session) return
  const id = String(formData.get('id') ?? '')
  const note = String(formData.get('note') ?? '').slice(0, 300)
  if (!id) return
  await prisma.depositRequest.updateMany({
    where: { id, userId: session.userId, status: 'PENDING' },
    data: { userNote: note },
  })
  revalidatePath('/account/balance')
}
