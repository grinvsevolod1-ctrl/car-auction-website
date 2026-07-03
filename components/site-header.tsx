import Link from 'next/link'
import { LayoutDashboard, UserRound } from 'lucide-react'
import { Logo } from '@/components/logo'
import { MobileMenu } from '@/components/mobile-menu'
import { LogoutButton } from '@/components/logout-button'
import { getSession } from '@/lib/auth/session'

const NAV = [
  { href: '/auctions', label: 'Аукционы' },
  { href: '/#how', label: 'Как это работает' },
  { href: '/#guarantees', label: 'Гарантии' },
]

export async function SiteHeader() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              {session.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LayoutDashboard className="size-4" />
                  Админка
                </Link>
              )}
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <UserRound className="size-4" />
                {session.name.split(' ')[0]}
              </Link>
              <LogoutButton withLabel={false} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        <MobileMenu session={session} />
      </div>
    </header>
  )
}
