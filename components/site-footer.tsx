import Link from 'next/link'
import { Mail, Send } from 'lucide-react'
import { Logo } from '@/components/logo'

const columns = [
  {
    title: 'Аукцион',
    links: [
      { label: 'Все лоты', href: '/auctions' },
      { label: 'Как это работает', href: '/#how' },
      { label: 'Гарантии', href: '/#guarantees' },
    ],
  },
  {
    title: 'Аккаунт',
    links: [
      { label: 'Войти', href: '/login' },
      { label: 'Регистрация', href: '/register' },
      { label: 'Личный кабинет', href: '/account' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Онлайн-аукцион автомобилей в Беларуси. Прозрачные торги,
              проверенные лоты, честные ставки в реальном времени.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="mailto:info@ignis.by"
                aria-label="Написать на email"
                className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Mail className="size-5" />
              </a>
              <a
                href="https://t.me"
                aria-label="Telegram"
                className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Send className="size-5" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">
              Контакты
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:info@ignis.by"
                  className="transition-colors hover:text-foreground"
                >
                  info@ignis.by
                </a>
              </li>
              <li>Минск, Беларусь</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} IGNIS. Все права защищены.</p>
          <p>Онлайн-аукцион автомобилей</p>
        </div>
      </div>
    </footer>
  )
}
