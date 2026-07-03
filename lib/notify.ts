import 'server-only'
import { prisma } from './prisma'
import { sendMail, emailLayout } from './mail'
import { siteUrl } from './config'
import type { Prisma } from './generated/prisma/client'

type NotifyArgs = {
  userId: string
  type: 'outbid' | 'won' | 'ended' | 'welcome' | 'deposit' | 'kyc' | 'balance'
  title: string
  body: string
  lotId?: string
  email?: string // если передан — дублируем письмом
  emailHtml?: string // кастомный HTML для письма
  tx?: Prisma.TransactionClient
}

export async function notify({
  userId,
  type,
  title,
  body,
  lotId,
  email,
  emailHtml,
  tx,
}: NotifyArgs) {
  const db = tx ?? prisma
  await db.notification.create({
    data: { userId, type, title, body, lotId: lotId ?? null },
  })

  if (email) {
    // Письмо шлём вне транзакции только когда tx не передан;
    // при наличии tx письмо отправит вызывающий код после коммита.
    if (!tx) {
      await sendMail({
        to: email,
        subject: `${title} — IGNIS`,
        html: emailHtml ?? emailLayout(title, `<p>${body}</p>`),
        text: body,
      })
    }
  }
}

export function outbidEmail(lotTitle: string, lotId: string, price: number) {
  const url = `${siteUrl()}/auctions/${lotId}`
  return emailLayout(
    'Вашу ставку перебили',
    `<p>По лоту <b>${lotTitle}</b> сделана более высокая ставка.</p>
     <p>Текущая цена: <b>${price.toLocaleString('ru-RU')} Br</b>.</p>
     <p><a href="${url}" style="display:inline-block;margin-top:8px;background:#f97316;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700">Сделать новую ставку</a></p>`,
  )
}

export function endingSoonEmail(
  lotTitle: string,
  lotId: string,
  price: number,
  minutesLeft: number,
) {
  const url = `${siteUrl()}/auctions/${lotId}`
  return emailLayout(
    'Лот из избранного скоро завершится',
    `<p>Торги по лоту <b>${lotTitle}</b> завершатся примерно через <b>${minutesLeft} мин</b>.</p>
     <p>Текущая цена: <b>${price.toLocaleString('ru-RU')} Br</b>.</p>
     <p>Успейте сделать ставку, чтобы не упустить автомобиль.</p>
     <p><a href="${url}" style="display:inline-block;margin-top:8px;background:#f97316;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700">Перейти к торгам</a></p>`,
  )
}

export function wonEmail(lotTitle: string, lotId: string, price: number) {
  const url = `${siteUrl()}/auctions/${lotId}`
  return emailLayout(
    'Поздравляем с победой!',
    `<p>Вы выиграли лот <b>${lotTitle}</b>.</p>
     <p>Финальная цена: <b>${price.toLocaleString('ru-RU')} Br</b>.</p>
     <p>Мы свяжемся с вами для оформления. Детали лота:</p>
     <p><a href="${url}" style="display:inline-block;margin-top:8px;background:#f97316;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700">Открыть лот</a></p>`,
  )
}
