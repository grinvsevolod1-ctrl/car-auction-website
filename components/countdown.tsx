'use client'

import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/format'

export function Countdown({
  endsAt,
  className,
  size = 'md',
  onEnd,
}: {
  endsAt: string | Date
  className?: string
  size?: 'sm' | 'md'
  onEnd?: () => void
}) {
  const target = new Date(endsAt).getTime()
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = Math.max(0, Math.floor((target - now) / 1000))

  useEffect(() => {
    if (remaining <= 0) onEnd?.()
  }, [remaining, onEnd])
  const { d, h, m, s } = formatCountdown(remaining)
  const ended = remaining <= 0

  if (ended) {
    return (
      <span className={className}>
        <span className="font-mono text-sm font-semibold text-muted-foreground">
          Торги завершены
        </span>
      </span>
    )
  }

  const box =
    size === 'sm'
      ? 'min-w-7 px-1 py-0.5 text-sm'
      : 'min-w-10 px-1.5 py-1 text-lg'

  const Unit = ({ value, label }: { value: string | number; label: string }) => (
    <div className="flex flex-col items-center">
      <span
        className={`rounded-md bg-foreground text-center font-mono font-semibold tabular-nums text-background ${box}`}
      >
        {value}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )

  return (
    <div className={`flex items-start gap-1.5 ${className ?? ''}`}>
      {d > 0 && <Unit value={d} label="дн" />}
      <Unit value={h} label="час" />
      <Unit value={m} label="мин" />
      <Unit value={s} label="сек" />
    </div>
  )
}
