import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2.5', className)}
      aria-label="IGNIS — на главную"
    >
      <span className="relative inline-flex size-9 items-center justify-center rounded-lg bg-foreground text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-primary"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.5 2c.3 2.6-1 4.2-2.4 5.7C9.6 9.3 8 10.9 8 13.5a4 4 0 0 0 8 .2c0-1-.3-1.9-.7-2.7 1.6.5 2.7 2 2.7 4a6 6 0 1 1-11.8-1.6C5.1 9.9 9.9 8.4 9.6 3.4 11 4 12 4.9 12.6 6c.6-1.2.9-2.6.9-4Z" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-bold tracking-[0.14em] text-foreground">
            IGNIS
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Автоаукцион
          </span>
        </span>
      )}
    </Link>
  )
}
