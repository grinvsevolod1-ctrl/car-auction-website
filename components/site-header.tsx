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
    <header className="sticky top-0 z-50 bg-header text-header-foreground shadow-md">
      {/* Верхняя строка: логотип, поиск, аккаунт */}
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo onDark />

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
            className="w-full rounded-md border border-transparent bg-card py-2.5 pl-4 pr-11 text-sm text-foreground outline-none transition-colors focus:border-primary"
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
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-header-muted transition-colors hover:bg-white/10 hover:text-header-foreground"
                >
                  <LayoutDashboard className="size-4" />
                  Админка
                </Link>
              )}
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-3 py-2 text-sm font-medium text-header-foreground transition-colors hover:bg-white/10"
              >
                <UserRound className="size-4" />
                {session.name.split(' ')[0]}
              </Link>
              <LogoutButton withLabel={false} />
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Регистрация
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-md bg-info px-4 py-2 text-sm font-semibold text-info-foreground transition-colors hover:bg-info/90"
              >
                <LogIn className="size-4" />
                Вход
              </Link>
            </>
          )}
        </div>

        <MobileMenu session={session} />
      </div>

      {/* Нижняя строка: навигация */}
      <nav className="hidden border-t border-white/10 bg-black/15 md:block">
        <div className="mx-auto flex max-w-6xl items-center px-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-header-foreground/85 transition-colors hover:border-primary hover:bg-white/5 hover:text-header-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
