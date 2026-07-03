'use client'

import { useState } from 'react'
import { Flame, Menu, X, Phone } from 'lucide-react'

const nav = [
  { label: 'Аукционы', href: '#auctions' },
  { label: 'Как это работает', href: '#how' },
  { label: 'Гарантии', href: '#why' },
  { label: 'Контакты', href: '#footer' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="size-5" />
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-widest">
            Ignis
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="tel:+375291234567"
            className="flex items-center gap-2 text-sm font-medium text-foreground/90"
          >
            <Phone className="size-4 text-primary" />
            +375 29 123-45-67
          </a>
          <a
            href="#auctions"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Смотреть торги
          </a>
        </div>

        <button
          type="button"
          aria-label="Меню"
          onClick={() => setOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-lg border border-border md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-border bg-background/95 p-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#auctions"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Смотреть торги
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
