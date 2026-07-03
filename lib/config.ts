// Общие настройки портала IGNIS.
// Значения можно переопределить через переменные окружения на VPS.

function num(name: string, fallback: number): number {
  const v = process.env[name]
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

// Антиснайпинг: если ставка сделана в последние N секунд до конца —
// торги продлеваются на такое же время, чтобы у всех был шанс ответить.
export const ANTISNIPE_WINDOW_SEC = num('ANTISNIPE_WINDOW_SEC', 120)
export const ANTISNIPE_EXTEND_SEC = num('ANTISNIPE_EXTEND_SEC', 120)

// Требовать подтверждения email для участия в торгах.
// Выключается переменной REQUIRE_EMAIL_VERIFICATION=false.
export const REQUIRE_EMAIL_VERIFICATION =
  process.env.REQUIRE_EMAIL_VERIFICATION !== 'false'

// Срок жизни токена подтверждения email, часов.
export const VERIFICATION_TTL_HOURS = num('VERIFICATION_TTL_HOURS', 48)

// Пагинация каталога.
export const CATALOG_PAGE_SIZE = num('CATALOG_PAGE_SIZE', 12)

// Rate limiting (запросов за окно).
export const RATE_LIMITS = {
  login: { limit: num('RL_LOGIN', 8), windowSec: 60 },
  register: { limit: num('RL_REGISTER', 4), windowSec: 600 },
  bid: { limit: num('RL_BID', 20), windowSec: 30 },
  upload: { limit: num('RL_UPLOAD', 40), windowSec: 60 },
} as const

// Базовый URL сайта (для ссылок в письмах).
export function siteUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

export const SITE_NAME = 'IGNIS'
