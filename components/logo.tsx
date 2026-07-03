import Link from 'next/link'
import { Gavel } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string
  compact?: boolean
  onDark?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2.5', className)}
      aria-label="IGNIS — на главную"
    >
      <span className="relative inline-flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Gavel className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-xl font-bold tracking-[0.08em]',
              onDark ? 'text-header-foreground' : 'text-foreground',
            )}
          >
            IGNIS
          </span>
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-[0.22em]',
              onDark ? 'text-header-muted' : 'text-primary',
            )}
          >
            Автоаукцион
          </span>
        </span>
      )}
    </Link>
  )
}
