import Link from 'next/link'
import { getAdminStats, getRecentBids } from '@/lib/admin-queries'
import { formatBYN, formatDateTime } from '@/lib/format'
import { Car, Users, Gavel, Banknote, FileEdit, CheckCircle2, PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [stats, recentBids] = await Promise.all([getAdminStats(), getRecentBids(8)])

  const cards = [
    { label: 'Активные торги', value: stats.active, icon: Gavel },
    { label: 'Черновики', value: stats.draft, icon: FileEdit },
    { label: 'Продано', value: stats.sold, icon: CheckCircle2 },
    { label: 'Пользователи', value: stats.users, icon: Users },
    { label: 'Всего ставок', value: stats.bids, icon: Car },
    { label: 'Оборот (продано)', value: formatBYN(stats.revenue), icon: Banknote },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
            Обзор
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Сводка по аукциону и последние ставки.
          </p>
        </div>
        <Link
          href="/admin/lots/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          <PlusCircle className="size-4" />
          Добавить лот
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="size-5 text-primary" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            Последние ставки
          </h2>
        </div>
        {recentBids.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Ставок пока нет.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentBids.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/auctions/${b.lot.id}`}
                    className="truncate font-medium hover:text-primary"
                  >
                    {b.lot.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {b.user.name} · {formatDateTime(b.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-primary">
                  {formatBYN(b.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
