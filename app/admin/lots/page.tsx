import Link from 'next/link'
import Image from 'next/image'
import { getAdminLots } from '@/lib/admin-queries'
import { formatBYN, formatDateTime, statusLabel } from '@/lib/format'
import { LotRowActions } from '@/components/admin/lot-row-actions'
import { PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-primary/10 text-primary',
  ENDED: 'bg-muted text-muted-foreground',
  SOLD: 'bg-primary text-primary-foreground',
}

export default async function AdminLotsPage() {
  const lots = await getAdminLots()

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
            Лоты
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Всего лотов: {lots.length}
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

      {lots.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl font-bold">Лотов пока нет</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Добавьте первый автомобиль, чтобы запустить торги.
          </p>
          <Link
            href="/admin/lots/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
          >
            <PlusCircle className="size-4" />
            Добавить лот
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Лот</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Цена</th>
                  <th className="px-4 py-3 font-medium">Ставки</th>
                  <th className="px-4 py-3 font-medium">Окончание</th>
                  <th className="px-4 py-3 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {lot.images[0] && (
                            <Image
                              src={lot.images[0]}
                              alt={lot.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <span className="font-medium">{lot.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          (statusStyles[lot.status] ?? 'bg-muted')
                        }
                      >
                        {statusLabel(lot.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatBYN(lot.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lot._count.bids}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(lot.endsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <LotRowActions id={lot.id} canFinalize={lot.status === 'ACTIVE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
