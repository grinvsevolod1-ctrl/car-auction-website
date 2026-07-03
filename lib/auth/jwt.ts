import { jwtVerify, SignJWT } from 'jose'

// Edge-safe: используется и в серверных компонентах, и в proxy (middleware).
export const SESSION_COOKIE = 'ignis_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 дней

export type SessionPayload = {
  userId: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error(
      'AUTH_SECRET не задан или слишком короткий. Сгенерируйте: openssl rand -base64 32',
    )
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    })
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string' &&
      (payload.role === 'USER' || payload.role === 'ADMIN')
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
    }
    return null
  } catch {
    return null
  }
}
