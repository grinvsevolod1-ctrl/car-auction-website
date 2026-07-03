'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import type { SessionPayload } from '@/lib/auth/jwt'

const NAV = [
  { href: '/auctions', label: 'Аукционы' },
  { href: '/#how', label: 'Как это работает' },
  { href: '/#guarantees', label: 'Гарантии' },
]

export function MobileMenu({ session }: { session: SessionPayload | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
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
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Личный кабинет
                </Link>
                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
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
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
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
