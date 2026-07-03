'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSession, destroySession, getSession } from '@/lib/auth/session'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

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
