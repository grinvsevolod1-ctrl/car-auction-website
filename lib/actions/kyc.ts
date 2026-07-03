'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/security'
import { notify } from '@/lib/notify'

export type KycState = { error?: string; success?: string }

function age(birth: Date): number {
  const now = new Date()
  let a = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) a--
  return a
}

const schema = z.object({
  firstName: z.string().trim().min(2, 'Укажите имя'),
  lastName: z.string().trim().min(2, 'Укажите фамилию'),
  middleName: z.string().trim().optional(),
  birthDate: z.string().trim().min(1, 'Укажите дату рождения'),
  passportNumber: z.string().trim().min(4, 'Укажите паспорт / ID'),
  country: z.string().trim().min(2, 'Укажите страну'),
  city: z.string().trim().min(2, 'Укажите город'),
  address: z.string().trim().min(4, 'Укажите адрес'),
  phone: z.string().trim().min(6, 'Укажите телефон'),
  occupation: z.string().trim().optional(),
  sourceOfFunds: z.string().trim().optional(),
  ageConfirmed: z.literal('on', {
    errorMap: () => ({ message: 'Подтвердите, что вам исполнилось 18 лет' }),
  }),
})

// Отправка анкеты KYC на модерацию. Проверяет возраст 18+.
export async function submitKycAction(
  _prev: KycState,
  formData: FormData,
): Promise<KycState> {
  const g = await guard('kyc', 6, 300)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) return { error: 'Требуется вход' }

  const parsed = schema.safeParse({
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    middleName: String(formData.get('middleName') ?? '') || undefined,
    birthDate: String(formData.get('birthDate') ?? ''),
    passportNumber: String(formData.get('passportNumber') ?? ''),
    country: String(formData.get('country') ?? ''),
    city: String(formData.get('city') ?? ''),
    address: String(formData.get('address') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    occupation: String(formData.get('occupation') ?? '') || undefined,
    sourceOfFunds: String(formData.get('sourceOfFunds') ?? '') || undefined,
    ageConfirmed: formData.get('ageConfirmed') ?? undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте анкету' }
  }
  const d = parsed.data

  const birth = new Date(d.birthDate)
  if (Number.isNaN(birth.getTime())) {
    return { error: 'Некорректная дата рождения' }
  }
  if (age(birth) < 18) {
    return { error: 'Участие в торгах доступно только с 18 лет' }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      middleName: d.middleName ?? null,
      birthDate: birth,
      passportNumber: d.passportNumber,
      country: d.country,
      city: d.city,
      address: d.address,
      phone: d.phone,
      occupation: d.occupation ?? null,
      sourceOfFunds: d.sourceOfFunds ?? null,
      ageConfirmed: true,
      kycStatus: 'PENDING',
      kycSubmittedAt: new Date(),
      kycReviewedAt: null,
      kycRejectReason: null,
    },
  })

  await notify({
    userId: session.userId,
    type: 'kyc',
    title: 'Анкета отправлена на проверку',
    body: 'Мы проверим ваши данные. Обычно это занимает немного времени.',
  })

  revalidatePath('/account')
  revalidatePath('/account/verification')
  return { success: 'Анкета отправлена на проверку' }
}
