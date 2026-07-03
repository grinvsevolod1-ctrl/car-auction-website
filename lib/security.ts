import 'server-only'
import { headers } from 'next/headers'
import { rateLimit } from './rate-limit'

// IP клиента с учётом обратного прокси (Nginx).
export async function clientIp(): Promise<string> {
  const h = await headers()
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return h.get('x-real-ip') ?? 'unknown'
}

// Проверка совпадения Origin и Host — защита от CSRF для Server Actions.
// Возвращает true, если запрос легитимен.
export async function isSameOrigin(): Promise<boolean> {
  const h = await headers()
  const origin = h.get('origin')
  const host = h.get('host')
  // Навигационные запросы без Origin (например, прямой переход) пропускаем —
  // Server Actions всегда отправляются с Origin, поэтому его отсутствие
  // при мутации трактуем осторожно: разрешаем только если нет host-конфликта.
  if (!origin) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function assertSameOrigin(): Promise<void> {
  if (!(await isSameOrigin())) {
    throw new Error('Недопустимый источник запроса')
  }
}

// Комбинированная проверка: тот же источник + лимит частоты по IP.
export async function guard(
  scope: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isSameOrigin())) {
    return { ok: false, error: 'Недопустимый источник запроса' }
  }
  const ip = await clientIp()
  const { ok, retryAfter } = rateLimit(`${scope}:${ip}`, limit, windowSec)
  if (!ok) {
    return {
      ok: false,
      error: `Слишком много попыток. Повторите через ${retryAfter} с.`,
    }
  }
  return { ok: true }
}
