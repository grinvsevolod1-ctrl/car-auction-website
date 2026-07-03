import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с командой онлайн-аукциона IGNIS.',
}

const contacts = [
  {
    icon: Mail,
    title: 'Email',
    value: 'info@ignis.by',
    href: 'mailto:info@ignis.by',
  },
  {
    icon: Phone,
    title: 'Телефон',
    value: '+375 (29) 000-00-00',
    href: 'tel:+375290000000',
  },
  {
    icon: Send,
    title: 'Telegram',
    value: '@ignis_auction',
    href: 'https://t.me',
  },
]

export default function ContactsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
              Контакты
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Есть вопрос по лоту, ставке или сделке? Мы на связи и поможем.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            {contacts.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold">{c.title}</h2>
                <p className="mt-1 text-muted-foreground">{c.value}</p>
              </a>
            ))}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">Адрес</h2>
                <p className="mt-1 text-muted-foreground">
                  г. Минск, Беларусь
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Clock className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">Часы работы</h2>
                <p className="mt-1 text-muted-foreground">
                  Пн–Пт: 9:00–19:00
                  <br />
                  Сб–Вс: 10:00–16:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
