'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin } from '@/lib/security'
import { notify, wonEmail } from '@/lib/notify'
import { sendMail } from '@/lib/mail'
import { captureWinner, releaseAllHolds } from '@/lib/balance'

export type LotFormState = { error?: string }

const num = (v: FormDataEntryValue | null) =>
  v == null || String(v).trim() === '' ? undefined : Number(v)

const lotSchema = z.object({
  title: z.string().trim().min(3, 'Укажите заголовок лота'),
  make: z.string().trim().min(1, 'Укажите марку'),
  model: z.string().trim().min(1, 'Укажите модель'),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0),
  engineVol: z.number().min(0).max(12).optional(),
  power: z.number().int().min(0).max(2000).optional(),
  transmission: z.string().trim().optional(),
  bodyType: z.string().trim().optional(),
  fuelType: z.string().trim().optional(),
  drive: z.string().trim().optional(),
  color: z.string().trim().optional(),
  vin: z.string().trim().optional(),
  location: z.string().trim().optional(),
  condition: z.string().trim().optional(),
  description: z.string().trim().optional(),
  originCountry: z.string().trim().optional(),
  region: z.string().trim().optional(),
  auctionSource: z.string().trim().optional(),
  lotNumber: z.string().trim().optional(),
  titleStatus: z.string().trim().optional(),
  damageType: z.string().trim().optional(),
  customsFeeBase: z.number().int().min(0).optional(),
  currency: z.enum(['BYN', 'USD']).default('BYN'),
  images: z
    .array(
      z
        .string()
        .trim()
        .refine(
          (s) => s.startsWith('/') || /^https?:\/\//.test(s),
          'Некорректный адрес изображения',
        ),
    )
    .default([]),
  startPrice: z.number().int().min(1, 'Стартовая цена должна быть больше 0'),
  bidStep: z.number().int().min(1, 'Шаг ставки должен быть больше 0'),
  buyNowPrice: z.number().int().min(0).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ENDED', 'SOLD']),
  endsAt: z.date(),
})

function parseForm(formData: FormData) {
  const imagesRaw = String(formData.get('images') ?? '')
  const images = imagesRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const endsAtRaw = String(formData.get('endsAt') ?? '')
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : new Date(NaN)

  return lotSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    make: String(formData.get('make') ?? ''),
    model: String(formData.get('model') ?? ''),
    year: num(formData.get('year')),
    mileage: num(formData.get('mileage')),
    engineVol: num(formData.get('engineVol')),
    power: num(formData.get('power')),
    transmission: String(formData.get('transmission') ?? '') || undefined,
    bodyType: String(formData.get('bodyType') ?? '') || undefined,
    fuelType: String(formData.get('fuelType') ?? '') || undefined,
    drive: String(formData.get('drive') ?? '') || undefined,
    color: String(formData.get('color') ?? '') || undefined,
    vin: String(formData.get('vin') ?? '') || undefined,
    location: String(formData.get('location') ?? '') || undefined,
    condition: String(formData.get('condition') ?? '') || undefined,
    description: String(formData.get('description') ?? '') || undefined,
    images,
    startPrice: num(formData.get('startPrice')),
    bidStep: num(formData.get('bidStep')),
    buyNowPrice: num(formData.get('buyNowPrice')),
    status: String(formData.get('status') ?? 'DRAFT'),
    endsAt,
  })
}

export async function createLotAction(
  _prev: LotFormState,
  formData: FormData,
): Promise<LotFormState> {
  await requireAdmin()
  await assertSameOrigin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте поля формы' }
  }
  const d = parsed.data
  await prisma.lot.create({
    data: {
      ...d,
      buyNowPrice: d.buyNowPrice || null,
      currentPrice: d.startPrice,
    },
  })
  revalidatePath('/admin/lots')
  revalidatePath('/auctions')
  redirect('/admin/lots')
}

export async function updateLotAction(
  id: string,
  _prev: LotFormState,
  formData: FormData,
): Promise<LotFormState> {
  await requireAdmin()
  await assertSameOrigin()
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте поля формы' }
  }
  const d = parsed.data

  const existing = await prisma.lot.findUnique({
    where: { id },
    select: { currentPrice: true, startPrice: true },
  })
  if (!existing) return { error: 'Лот не найден' }

  // Если ставок ещё не было (текущая = стартовой), синхронизируем текущую с новой стартовой.
  const currentPrice =
    existing.currentPrice === existing.startPrice ? d.startPrice : existing.currentPrice

  await prisma.lot.update({
    where: { id },
    data: { ...d, buyNowPrice: d.buyNowPrice || null, currentPrice },
  })
  revalidatePath('/admin/lots')
  revalidatePath(`/auctions/${id}`)
  revalidatePath('/auctions')
  redirect('/admin/lots')
}

export async function deleteLotAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  if (id) {
    await prisma.lot.delete({ where: { id } })
    revalidatePath('/admin/lots')
    revalidatePath('/auctions')
  }
}

// Завершить торги вручную: назначить победителя по максимальной ставке.
export async function finalizeLotAction(formData: FormData): Promise<void> {
  await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const lot = await prisma.lot.findUnique({
    where: { id },
    select: { title: true, status: true },
  })
  if (!lot || (lot.status !== 'ACTIVE' && lot.status !== 'DRAFT')) return

  const topBid = await prisma.bid.findFirst({
    where: { lotId: id },
    orderBy: { amount: 'desc' },
    include: { user: { select: { id: true, email: true } } },
  })
  await prisma.lot.update({
    where: { id },
    data: {
      status: topBid ? 'SOLD' : 'ENDED',
      winnerId: topBid?.userId ?? null,
      currentPrice: topBid?.amount ?? undefined,
      endsAt: new Date(),
    },
  })

  // Уведомляем победителя.
  if (topBid) {
    await notify({
      userId: topBid.userId,
      type: 'won',
      title: 'Вы выиграли лот',
      body: `Лот «${lot.title}» продан вам за ${topBid.amount.toLocaleString('ru-RU')} Br.`,
      lotId: id,
    })
    await sendMail({
      to: topBid.user.email,
      subject: 'Поздравляем с победой на торгах — IGNIS',
      html: wonEmail(lot.title, id, topBid.amount),
      text: `Вы выиграли лот «${lot.title}» за ${topBid.amount} Br.`,
    })
  }

  revalidatePath('/admin/lots')
  revalidatePath(`/auctions/${id}`)
  revalidatePath('/auctions')
}

// Изменить роль пользователя.
export async function setUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  await assertSameOrigin()
  const id = String(formData.get('id') ?? '')
  const role = String(formData.get('role') ?? '')
  if (!id || (role !== 'USER' && role !== 'ADMIN')) return
  if (id === admin.userId) return // нельзя менять свою роль
  await prisma.user.update({ where: { id }, data: { role } })
  revalidatePath('/admin/users')
}
