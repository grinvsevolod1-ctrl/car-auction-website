import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getUserDashboard } from '@/lib/queries'
import { formatBYN, statusLabel } from '@/lib/format'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Trophy, Gavel, Flame, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Личный кабинет — IGNIS' }

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account')

  const { rows, stats } = await getUserDashboard(user.id)

  const cards = [
    { label: 'Участвую в торгах', value: stats.participating, icon: Gavel },
    { label: 'Лидирую сейчас', value: stats.leading, icon: Flame },
    { label: 'Выиграно лотов', value: stats.won, icon: Trophy },
  ]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Личный кабинет</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Здравствуйте, {user.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="size-6" />
            </span>
            <div>
              <p className="font-display text-3xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          Мои ставки
        </h2>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              Вы ещё не делали ставок. Найдите автомобиль своей мечты на аукционе.
            </p>
            <Link
              href="/auctions"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Смотреть аукционы
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {rows.map((r) => (
              <Link
                key={r.lot.id}
                href={`/auctions/${r.lot.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                  {r.lot.images[0] && (
                    <Image
                      src={r.lot.images[0]}
                      alt={r.lot.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.lot.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Моя ставка: {formatBYN(r.myMax)} · Текущая: {formatBYN(r.lot.currentPrice)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {r.isWon ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <Trophy className="size-3" /> Выигран
                    </span>
                  ) : r.isLeading ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Flame className="size-3" /> Лидирую
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {r.lot.status === 'ACTIVE' ? 'Перебита' : statusLabel(r.lot.status)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {user.role === 'ADMIN' && (
        <div className="mt-10 rounded-2xl border border-primary/25 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-tight">
                Панель администратора
              </p>
              <p className="text-sm text-muted-foreground">
                Управление лотами, ставками и пользователями.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Открыть админку
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
      </main>
      <SiteFooter />
    </div>
  )
}
