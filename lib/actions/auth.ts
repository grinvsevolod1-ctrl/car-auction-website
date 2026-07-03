'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  createSession,
  destroySession,
  getSession,
} from '@/lib/auth/session'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/security'
import { RATE_LIMITS } from '@/lib/config'
import { createAndSendVerification } from '@/lib/verification'
import { notify } from '@/lib/notify'

export type AuthState = {
  error?: string
  values?: { name?: string; email?: string }
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Укажите имя (минимум 2 символа)'),
    email: z.string().trim().toLowerCase().email('Некорректный email'),
    password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  })

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const g = await guard(
    'register',
    RATE_LIMITS.register.limit,
    RATE_LIMITS.register.windowSec,
  )
  if (!g.ok) return { error: g.error }

  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  }
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Проверьте данные',
      values: { name: raw.name, email: raw.email },
    }
  }
  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return {
      error: 'Пользователь с таким email уже зарегистрирован',
      values: { name, email },
    }
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  })

  // Приветственное уведомление + письмо подтверждения email.
  await notify({
    userId: user.id,
    type: 'welcome',
    title: 'Добро пожаловать в IGNIS',
    body: 'Подтвердите email, чтобы участвовать в торгах.',
  })
  try {
    await createAndSendVerification(user)
  } catch (e) {
    console.error('[register] verification email error:', e)
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  redirect('/account')
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const g = await guard(
    'login',
    RATE_LIMITS.login.limit,
    RATE_LIMITS.login.windowSec,
  )
  if (!g.ok) return { error: g.error }

  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    next: String(formData.get('next') ?? ''),
  }
  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Проверьте данные',
      values: { email: raw.email },
    }
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return {
      error: 'Неверный email или пароль',
      values: { email: parsed.data.email },
    }
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const next = raw.next && raw.next.startsWith('/') ? raw.next : '/account'
  redirect(next)
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/')
}

export async function getSessionForClient() {
  return getSession()
}

export type SimpleState = { error?: string; success?: string }

// Повторная отправка письма подтверждения email.
export async function resendVerificationAction(): Promise<SimpleState> {
  const g = await guard('register', 3, 600)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) return { error: 'Требуется вход' }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, emailVerified: true },
  })
  if (!user) return { error: 'Пользователь не найден' }
  if (user.emailVerified) return { success: 'Email уже подтверждён' }

  try {
    await createAndSendVerification(user)
  } catch {
    return { error: 'Не удалось отправить письмо. Попробуйте позже.' }
  }
  return { success: 'Письмо отправлено. Проверьте почту.' }
}

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя (минимум 2 символа)'),
  phone: z
    .string()
    .trim()
    .max(32, 'Слишком длинный номер')
    .optional()
    .or(z.literal('')),
})

// Обновление профиля (имя, телефон).
export async function updateProfileAction(
  _prev: SimpleState,
  formData: FormData,
): Promise<SimpleState> {
  const g = await guard('login', 20, 60)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) return { error: 'Требуется вход' }

  const parsed = profileSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные' }
  }

  const phone = parsed.data.phone ? parsed.data.phone : null
  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name, phone },
  })

  // Обновляем имя в сессии.
  await createSession({
    userId: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
  })

  revalidatePath('/account')
  revalidatePath('/account/settings')
  return { success: 'Профиль обновлён' }
}

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Введите текущий пароль'),
    next: z.string().min(8, 'Новый пароль не короче 8 символов'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  })

// Смена пароля.
export async function changePasswordAction(
  _prev: SimpleState,
  formData: FormData,
): Promise<SimpleState> {
  const g = await guard('login', 10, 60)
  if (!g.ok) return { error: g.error }

  const session = await getSession()
  if (!session) return { error: 'Требуется вход' }

  const parsed = passwordSchema.safeParse({
    current: String(formData.get('current') ?? ''),
    next: String(formData.get('next') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверьте данные' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  })
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { error: 'Текущий пароль неверный' }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  })
  return { success: 'Пароль изменён' }
}
