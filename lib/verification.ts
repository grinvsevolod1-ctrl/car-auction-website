import 'server-only'
import { randomBytes } from 'crypto'
import { prisma } from './prisma'
import { sendMail, emailLayout } from './mail'
import { siteUrl, VERIFICATION_TTL_HOURS } from './config'

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
