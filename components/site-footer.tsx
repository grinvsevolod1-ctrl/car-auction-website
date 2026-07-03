import Link from 'next/link'
import { Mail, Send, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/logo'

const columns = [
  {
    title: 'Аукцион',
    links: [
      { label: 'Все лоты', href: '/auctions' },
      { label: 'Как это работает', href: '/#how' },
      { label: 'О компании', href: '/about' },
      { label: 'Правила аукциона', href: '/rules' },
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
    <footer>
      {/* Зелёный баннер подписки */}
      <div className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-primary-foreground/15 text-primary-foreground">
              <Send className="size-5" />
            </span>
            <p className="text-lg font-bold text-primary-foreground">
              Подписаться на новые поступления
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Подписаться
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Основной футер */}
      <div className="border-t border-border bg-card">
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
                  className="grid size-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Mail className="size-5" />
                </a>
                <a
                  href="https://t.me"
                  aria-label="Telegram"
                  className="grid size-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
                    className="transition-colors hover:text-primary"
                  >
                    info@ignis.by
                  </a>
                </li>
                <li>Минск, Беларусь</li>
                <li>
                  <Link
                    href="/contacts"
                    className="transition-colors hover:text-primary"
                  >
                    Все контакты
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} IGNIS. Все права защищены.</p>
            <p>Онлайн-аукцион автомобилей</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
