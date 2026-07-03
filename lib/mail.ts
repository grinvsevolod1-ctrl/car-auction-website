import 'server-only'
import nodemailer from 'nodemailer'
import { SITE_NAME } from './config'

type SendArgs = { to: string; subject: string; html: string; text?: string }

let cached: nodemailer.Transporter | null = null

function getTransport(): nodemailer.Transporter | null {
  if (cached) return cached
  const host = process.env.SMTP_HOST
  if (!host) return null // SMTP не настроен — работаем в dev-режиме (лог в консоль)

  cached = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  })
  return cached
}

export async function sendMail({ to, subject, html, text }: SendArgs) {
  const from =
    process.env.SMTP_FROM ?? `${SITE_NAME} <no-reply@localhost>`
  const transport = getTransport()

  if (!transport) {
    // Без SMTP письмо не уходит — печатаем в лог, чтобы не терять ссылки в dev.
    console.log(
      `[mail] SMTP не настроен. Письмо для ${to}: ${subject}\n${text ?? html}`,
    )
    return { delivered: false }
  }

  try {
    await transport.sendMail({ from, to, subject, html, text })
    return { delivered: true }
  } catch (e) {
    console.error('[mail] Ошибка отправки:', e)
    return { delivered: false }
  }
}

// Простой HTML-шаблон письма в фирменном стиле.
export function emailLayout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f2ee;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">
        <tr><td style="background:#1c1917;padding:20px 28px">
          <span style="color:#f97316;font-weight:800;font-size:20px;letter-spacing:1px">${SITE_NAME}</span>
          <span style="color:#a8a29e;font-size:12px"> · автоаукцион</span>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 12px;font-size:20px;color:#1c1917">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#faf9f7;color:#78716c;font-size:12px">
          Это автоматическое письмо ${SITE_NAME}. Если вы его не запрашивали — просто проигнорируйте.
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`
}
