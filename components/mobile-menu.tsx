'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import type { SessionPayload } from '@/lib/auth/jwt'

const NAV = [
  { href: '/', label: 'Главная' },
  { href: '/auctions', label: 'Аукционы' },
  { href: '/about', label: 'О компании' },
  { href: '/rules', label: 'Правила' },
  { href: '/contacts', label: 'Контакты' },
]

export function MobileMenu({ session }: { session: SessionPayload | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-md text-header-foreground hover:bg-white/10"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-card shadow-lg">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            <form action="/auctions" method="get" role="search" className="relative mb-2">
              <input
                type="search"
                name="q"
                placeholder="Поиск по марке или модели…"
                aria-label="Поиск"
                className="w-full rounded-md border border-border bg-background py-2.5 pl-4 pr-11 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Найти"
                className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md bg-primary text-primary-foreground"
              >
                <Search className="size-4" />
              </button>
            </form>

            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-border" />

            {session ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Личный кабинет
                </Link>
                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Админ-панель
                  </Link>
                )}
                <LogoutButton className="justify-start" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
