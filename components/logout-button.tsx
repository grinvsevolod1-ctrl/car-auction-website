import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

export function LogoutButton({
  className,
  withLabel = true,
}: {
  className?: string
  withLabel?: boolean
}) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className,
        )}
      >
        <LogOut className="size-4" />
        {withLabel && <span>Выйти</span>}
      </button>
    </form>
  )
}
