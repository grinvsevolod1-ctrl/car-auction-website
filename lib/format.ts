export function formatBYN(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' Br'
}

export function formatCountdown(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return { h: pad(h), m: pad(m), s: pad(sec) }
}
