'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin } from '@/lib/security'
import { creditDeposit } from '@/lib/balance'
import { notify } from '@/lib/notify'
import { setSetting, SETTING_DEFAULTS, type SettingKey } from '@/lib/settings'
import { isCryptoAsset } from '@/lib/money'

export type SimpleFormState = { error?: string; success?: string }

/* ---------- Платёжные ссылки ЕРИП ---------- */

const linkSchema = z.object({
  label: z.string().trim().min(1, 'Укажите название'),
  url: z.string().trim().url('Некорректная ссылка'),
  sortOrder: z.number().int().default(0),
})

export async function createPaymentLinkAction(
  _prev: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  await requireAdmin()
  await assertSameOrigin()
  const parsed = linkSchema.safeParse({
    label: String(formData.get('label') ?? ''),
    url: String(formData.get('url') ?? ''),
    sortOrder: Number(formData.get('sortOrder') ?? 0),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  await prisma.paymentLink.create({ data: parsed.data })
  revalidatePath('/admin/payments')
  return { success: 'Ссылка добавлена' }
}

export async function togglePaymentLinkAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  const link = await prisma.paymentLink.findUnique({ where: { id } })
  if (link) {
    await prisma.paymentLink.update({
      where: { id },
      data: { active: !link.active },
    })
  }
  revalidatePath('/admin/payments')
}

export async function deletePaymentLinkAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  if (id) await prisma.paymentLink.delete({ where: { id } })
  revalidatePath('/admin/payments')
}

/* ---------- Криптокошельки ---------- */

const walletSchema = z.object({
  asset: z.string().trim().min(1),
  network: z.string().trim().min(1, 'Укажите сеть'),
  address: z.string().trim().min(6, 'Укажите адрес кошелька'),
  note: z.string().trim().optional(),
  sortOrder: z.number().int().default(0),
})

export async function createWalletAction(
  _prev: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  await requireAdmin()
  await assertSameOrigin()
  const parsed = walletSchema.safeParse({
    asset: String(formData.get('asset') ?? ''),
    network: String(formData.get('network') ?? ''),
    address: String(formData.get('address') ?? ''),
    note: String(formData.get('note') ?? '') || undefined,
    sortOrder: Number(formData.get('sortOrder') ?? 0),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  if (!isCryptoAsset(parsed.data.asset)) return { error: 'Неизвестная монета' }
  await prisma.cryptoWallet.create({ data: parsed.data })
  revalidatePath('/admin/payments')
  return { success: 'Кошелёк добавлен' }
}

export async function toggleWalletAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  const w = await prisma.cryptoWallet.findUnique({ where: { id } })
  if (w) {
    await prisma.cryptoWallet.update({ where: { id }, data: { active: !w.active } })
  }
  revalidatePath('/admin/payments')
}

export async function deleteWalletAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  if (id) await prisma.cryptoWallet.delete({ where: { id } })
  revalidatePath('/admin/payments')
}

/* ---------- Заявки на пополнение ---------- */

// Подтвердить заявку: зачислить средства на баланс.
export async function confirmDepositAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  const adminNote = String(formData.get('adminNote') ?? '').slice(0, 300) || null
  if (!id) return

  await prisma.$transaction(async (tx) => {
    const dep = await tx.depositRequest.findUnique({ where: { id } })
    if (!dep || dep.status !== 'PENDING') return

    await tx.depositRequest.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        adminNote,
        reviewedAt: new Date(),
        reviewedBy: admin.userId,
      },
    })
    await creditDeposit(tx, dep.userId, dep.currency, dep.amount, {
      depositId: dep.id,
      note: `Пополнение ${dep.method} · ${dep.reference}`,
    })
    await notify({
      tx,
      userId: dep.userId,
      type: 'deposit',
      title: 'Баланс пополнен',
      body: `Заявка ${dep.reference} подтверждена. Средства зачислены.`,
    })
  })
  revalidatePath('/admin/deposits')
}

export async function rejectDepositAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  const adminNote = String(formData.get('adminNote') ?? '').slice(0, 300) || null
  if (!id) return

  const dep = await prisma.depositRequest.findUnique({ where: { id } })
  if (!dep || dep.status !== 'PENDING') return

  await prisma.depositRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      adminNote,
      reviewedAt: new Date(),
      reviewedBy: admin.userId,
    },
  })
  await notify({
    userId: dep.userId,
    type: 'deposit',
    title: 'Заявка на пополнение отклонена',
    body: `Заявка ${dep.reference} отклонена. ${adminNote ?? ''}`.trim(),
  })
  revalidatePath('/admin/deposits')
}

// Ручная корректировка баланса пользователя администратором.
const adjustSchema = z.object({
  userId: z.string().min(1),
  currency: z.enum(['BYN', 'USD']),
  amount: z.number().int(),
  note: z.string().trim().optional(),
})

export async function adjustBalanceAction(
  _prev: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  await requireAdmin()
  await assertSameOrigin()
  const parsed = adjustSchema.safeParse({
    userId: String(formData.get('userId') ?? ''),
    currency: String(formData.get('currency') ?? 'BYN'),
    amount: Number(formData.get('amount') ?? 0),
    note: String(formData.get('note') ?? '') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { userId, currency, amount, note } = parsed.data
  if (amount === 0) return { error: 'Сумма не может быть нулевой' }

  await prisma.$transaction(async (tx) => {
    await creditDeposit(tx, userId, currency, amount, {
      type: 'ADJUST',
      note: note ?? 'Корректировка администратором',
    })
  })
  revalidatePath('/admin/users')
  return { success: 'Баланс скорректирован' }
}

/* ---------- KYC-модерация ---------- */

export async function approveKycAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.user.update({
    where: { id },
    data: { kycStatus: 'APPROVED', kycReviewedAt: new Date(), kycRejectReason: null },
  })
  await notify({
    userId: id,
    type: 'kyc',
    title: 'Личность подтверждена',
    body: 'Верификация пройдена. Теперь вы можете участвовать в торгах.',
  })
  revalidatePath('/admin/kyc')
}

export async function rejectKycAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  const reason = String(formData.get('reason') ?? '').slice(0, 300) || 'Данные не прошли проверку'
  if (!id) return
  await prisma.user.update({
    where: { id },
    data: { kycStatus: 'REJECTED', kycReviewedAt: new Date(), kycRejectReason: reason },
  })
  await notify({
    userId: id,
    type: 'kyc',
    title: 'Верификация отклонена',
    body: reason,
  })
  revalidatePath('/admin/kyc')
}

/* ---------- Настройки портала ---------- */

export async function saveSettingsAction(
  _prev: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  await requireAdmin()
  await assertSameOrigin()
  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[]
  for (const key of keys) {
    const value = formData.get(key)
    if (value != null) {
      await setSetting(key, String(value).trim())
    }
  }
  revalidatePath('/admin/settings')
  return { success: 'Настройки сохранены' }
}
