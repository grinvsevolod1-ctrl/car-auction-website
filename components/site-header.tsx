import Link from 'next/link'
import { LayoutDashboard, UserRound, Search, LogIn } from 'lucide-react'
import { Logo } from '@/components/logo'
import { MobileMenu } from '@/components/mobile-menu'
import { LogoutButton } from '@/components/logout-button'
import { getSession } from '@/lib/auth/session'

const NAV = [
  { href: '/', label: 'Главная' },
  { href: '/auctions', label: 'Аукционы' },
  { href: '/about', label: 'О компании' },
  { href: '/rules', label: 'Правила' },
  { href: '/contacts', label: 'Контакты' },
]

export async function SiteHeader() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Верхняя строка: логотип, поиск, аккаунт */}
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />

        <form
          action="/auctions"
          method="get"
          role="search"
          className="relative hidden flex-1 md:block"
        >
          <input
            type="search"
            name="q"
            placeholder="Поиск по марке или модели…"
            aria-label="Поиск по сайту"
            className="w-full rounded-md border border-border bg-background py-2.5 pl-4 pr-11 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            aria-label="Найти"
            className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="size-4" />
          </button>
        </form>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {session ? (
            <>
              {session.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LayoutDashboard className="size-4" />
                  Админка
                </Link>
              )}
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <LogIn className="size-4" />
                Вход
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        <MobileMenu session={session} />
      </div>

      {/* Нижняя строка: зелёная навигация */}
      <nav className="hidden bg-primary md:block">
        <div className="mx-auto flex max-w-6xl items-center px-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/90 transition-colors hover:bg-black/10 hover:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
