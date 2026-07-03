import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionPayload,
} from './jwt'

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return verifySession(token)
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin')
  if (session.role !== 'ADMIN') redirect('/')
  return session
}
