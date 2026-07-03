import { getDeposits } from '@/lib/admin-queries'
import { formatMoney } from '@/lib/money'
import { formatDateTime } from '@/lib/format'
import {
  confirmDepositAction,
  rejectDepositAction,
} from '@/lib/actions/admin-payments'
import { Check, X, Copy } from 'lucide-react'

export const metadata = { title: 'Заявки на пополнение — Админка' }

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидает', cls: 'bg-highlight/15 text-highlight' },
  CONFIRMED: { label: 'Зачислено', cls: 'bg-success/15 text-success' },
  REJECTED: { label: 'Отклонено', cls: 'bg-destructive/15 text-destructive' },
}

export default async function AdminDepositsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter =
    status === 'CONFIRMED' || status === 'REJECTED' || status === 'PENDING'
      ? status
      : undefined
  const deposits = await getDeposits(filter)

  const tabs = [
    { key: 'PENDING', label: 'Ожидают' },
    { key: 'CONFIRMED', label: 'Зачислены' },
    { key: 'REJECTED', label: 'Отклонены' },
    { key: '', label: 'Все' },
  ]

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Заявки на пополнение</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Проверьте оплату и подтвердите зачисление средств вручную.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (filter ?? '') === t.key
          return (
            <a
              key={t.key}
              href={t.key ? `/admin/deposits?status=${t.key}` : '/admin/deposits'}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </a>
          )
        })}
      </div>

      <div className="space-y-3">
        {deposits.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Заявок нет
          </div>
        )}
        {deposits.map((d) => {
          const badge = STATUS_LABEL[d.status] ?? STATUS_LABEL.PENDING
          return (
            <div
              key={d.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {d.reference}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.user.name} · {d.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(d.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold">
                    {formatMoney(d.amount, d.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.method === 'ERIP'
                      ? `ЕРИП · ${d.paymentLink?.label ?? '—'}`
                      : `Крипта · ${d.wallet?.asset ?? ''} ${d.wallet?.network ?? ''}`}
                  </p>
                </div>
              </div>

              {(d.userNote || d.wallet?.address) && (
                <div className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
                  {d.wallet?.address && (
                    <p className="flex items-center gap-1.5 font-mono text-muted-foreground">
                      <Copy className="size-3" /> {d.wallet.address}
                    </p>
                  )}
                  {d.cryptoAmount && (
                    <p className="font-mono">
                      <span className="text-muted-foreground">К переводу: </span>
                      {d.cryptoAmount} {d.cryptoAsset ?? d.wallet?.asset ?? ''}
                    </p>
                  )}
                  {d.userNote && (
                    <p className="break-all font-mono">
                      <span className="text-muted-foreground">Хэш / коммент.: </span>
                      {d.userNote}
                    </p>
                  )}
                </div>
              )}

              {d.adminNote && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Комментарий: {d.adminNote}
                </p>
              )}

              {d.status === 'PENDING' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={confirmDepositAction} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={d.id} />
                    <input
                      name="adminNote"
                      placeholder="Комментарий (необязательно)"
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-success-foreground"
                    >
                      <Check className="size-4" />
                      Зачислить
                    </button>
                  </form>
                  <form action={rejectDepositAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                      Отклонить
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
