import 'server-only'

// Простой in-memory rate limiter. Подходит для одного инстанса на VPS.
// Для нескольких инстансов замените на Redis.
type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Периодическая очистка устаревших записей.
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 60000) return
  lastSweep = now
  for (const [k, v] of store) {
    if (v.resetAt <= now) store.delete(k)
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  sweep(now)
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return { ok: true, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true, retryAfter: 0 }
}
