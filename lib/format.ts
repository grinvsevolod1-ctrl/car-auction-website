export function formatBYN(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' Br'
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCountdown(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return { d, h: pad(h), m: pad(m), s: pad(sec) }
}

export const LOT_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Идут торги',
  ENDED: 'Завершён',
  SOLD: 'Продан',
}

export function statusLabel(status: string) {
  return LOT_STATUS_LABEL[status] ?? status
}
