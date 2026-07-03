import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import {
  getUserDashboard,
  getUserNotifications,
  getUserBalance,
  getUserKyc,
} from '@/lib/queries'
import { formatDateTime } from '@/lib/format'
import { formatMoney } from '@/lib/money'
import { REQUIRE_EMAIL_VERIFICATION } from '@/lib/config'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { VerifyBanner } from '@/components/verify-banner'
import { BidsTabs } from '@/components/account/bids-tabs'
import {
  Trophy,
  Gavel,
  Flame,
  ArrowRight,
  Bell,
  Settings,
  Heart,
  Wallet,
  ShieldCheck,
} from 'lucide-react'

const KYC_BADGE: Record<string, { label: string; cls: string }> = {
  NONE: { label: 'Не пройдена', cls: 'bg-muted text-muted-foreground' },
  PENDING: { label: 'На проверке', cls: 'bg-highlight/15 text-highlight' },
  APPROVED: { label: 'Подтверждена', cls: 'bg-success/15 text-success' },
  REJECTED: { label: 'Отклонена', cls: 'bg-destructive/15 text-destructive' },
}

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Личный кабинет — IGNIS' }

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account')

  const [{ rows, stats }, notifications, { balance }, kyc] = await Promise.all([
    getUserDashboard(user.id),
    getUserNotifications(user.id),
    getUserBalance(user.id),
    getUserKyc(user.id),
  ])

  const showVerify = REQUIRE_EMAIL_VERIFICATION && !user.emailVerified
  const kycStatus = kyc?.kycStatus ?? 'NONE'
  const kycBadge = KYC_BADGE[kycStatus] ?? KYC_BADGE.NONE
  const availByn = balance.balanceByn - balance.heldByn
  const availUsd = balance.balanceUsd - balance.heldUsd

  const cards = [
    { label: 'Участвую в торгах', value: stats.participating, icon: Gavel },
    { label: 'Лидирую сейчас', value: stats.leading, icon: Flame },
    { label: 'Выиграно лотов', value: stats.won, icon: Trophy },
  ]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Личный кабинет</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Здравствуйте, {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/account/watchlist"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <Heart className="size-4" />
            Избранное
          </Link>
          <Link
            href="/account/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <Settings className="size-4" />
            Настройки
          </Link>
        </div>
      </div>

      {showVerify && <VerifyBanner />}

      {/* Баланс и верификация */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4" />
              Баланс
            </span>
            <Link
              href="/account/balance"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Пополнить
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="font-display text-2xl font-bold">
                {formatMoney(availByn, 'BYN')}
              </p>
              <p className="text-xs text-muted-foreground">рубли · доступно</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold">
                {formatMoney(availUsd, 'USD')}
              </p>
              <p className="text-xs text-muted-foreground">крипта · доступно</p>
            </div>
          </div>
        </div>

        <Link
          href="/account/verification"
          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            Верификация личности
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className={`rounded-md px-2.5 py-1 text-sm font-medium ${kycBadge.cls}`}>
              {kycBadge.label}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
        <BidsTabs rows={rows} />
      </div>

      {notifications.length > 0 && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-tight">
            <Bell className="size-5" />
            Уведомления
          </h2>
          <ul className="mt-4 space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    n.read ? 'bg-muted-foreground/30' : 'bg-primary'
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {n.lotId ? (
                      <Link
                        href={`/auctions/${n.lotId}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {n.body}
                      </Link>
                    ) : (
                      n.body
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
