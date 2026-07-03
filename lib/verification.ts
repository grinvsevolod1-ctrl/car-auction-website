import 'server-only'
import { randomBytes, randomInt } from 'crypto'
import { prisma } from './prisma'
import { sendMail, emailLayout } from './mail'
import { siteUrl, VERIFICATION_TTL_HOURS } from './config'

// Срок жизни кода подтверждения email, минут.
const CODE_TTL_MIN = 15
const CODE_MAX_ATTEMPTS = 6

// Создаёт 6-значный код подтверждения email и отправляет его письмом.
export async function createAndSendEmailCode(user: {
  id: string
  email: string
  name: string
}) {
  await prisma.emailCode.deleteMany({ where: { userId: user.id } })

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000)
  await prisma.emailCode.create({
    data: { code, userId: user.id, expiresAt },
  })

  await sendMail({
    to: user.email,
    subject: `Код подтверждения ${code} — IGNIS`,
    html: emailLayout(
      `Здравствуйте, ${user.name}!`,
      `<p>Ваш код подтверждения адреса почты:</p>
       <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:16px 0;color:#15803d">${code}</p>
       <p style="color:#78716c;font-size:13px">Код действует ${CODE_TTL_MIN} минут. Если вы не регистрировались в IGNIS — проигнорируйте это письмо.</p>`,
    ),
    text: `Код подтверждения IGNIS: ${code} (действует ${CODE_TTL_MIN} мин)`,
  })
}

// Проверяет код подтверждения email. Возвращает статус.
export async function verifyEmailCode(
  userId: string,
  code: string,
): Promise<'ok' | 'invalid' | 'expired' | 'too_many'> {
  const rec = await prisma.emailCode.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  if (!rec) return 'invalid'
  if (rec.attempts >= CODE_MAX_ATTEMPTS) return 'too_many'
  if (rec.expiresAt.getTime() < Date.now()) {
    await prisma.emailCode.delete({ where: { id: rec.id } })
    return 'expired'
  }
  if (rec.code !== code.trim()) {
    await prisma.emailCode.update({
      where: { id: rec.id },
      data: { attempts: { increment: 1 } },
    })
    return 'invalid'
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailCode.deleteMany({ where: { userId } }),
  ])
  return 'ok'
}

// Создаёт токен подтверждения email и отправляет письмо со ссылкой.
export async function createAndSendVerification(user: {
  id: string
  email: string
  name: string
}) {
  // Удаляем старые токены подтверждения email этого пользователя.
  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, purpose: 'email' },
  })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_HOURS * 3600 * 1000)

  await prisma.verificationToken.create({
    data: { token, purpose: 'email', userId: user.id, expiresAt },
  })

  const url = `${siteUrl()}/verify?token=${token}`
  await sendMail({
    to: user.email,
    subject: 'Подтвердите email — IGNIS',
    html: emailLayout(
      `Здравствуйте, ${user.name}!`,
      `<p>Подтвердите адрес почты, чтобы участвовать в торгах IGNIS.</p>
       <p><a href="${url}" style="display:inline-block;margin-top:8px;background:#f97316;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700">Подтвердить email</a></p>
       <p style="color:#78716c;font-size:13px;margin-top:16px">Ссылка действует ${VERIFICATION_TTL_HOURS} ч. Если кнопка не работает, откройте: <br>${url}</p>`,
    ),
    text: `Подтвердите email: ${url}`,
  })
}

// Проверяет токен и помечает email подтверждённым. Возвращает статус.
export async function consumeVerificationToken(
  token: string,
): Promise<'ok' | 'invalid' | 'expired'> {
  if (!token) return 'invalid'
  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record || record.purpose !== 'email') return 'invalid'
  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { id: record.id } })
    return 'expired'
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({
      where: { userId: record.userId, purpose: 'email' },
    }),
  ])
  return 'ok'
}
