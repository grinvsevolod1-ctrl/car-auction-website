'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/money'
import { formatDateTime } from '@/lib/format'
import { confirmDepositAction, rejectDepositAction } from '@/lib/actions/admin-payments'
import { Check, X, Copy, ExternalLink } from 'lucide-react'

type Deposit = {
  id: string
  method: string
  status: string
  amount: number
  currency: string
  asset: string | null
  txHash: string | null
  reference: string | null
  createdAt: Date
  user: { id: string; name: string; email: string }
  paymentLink: { label: string } | null
  wallet: { asset: string; network: string; address: string } | null
}

export function DepositReview({ deposit }: { deposit: Deposit }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function confirm() {
    setPending(true)
    setError(null)
    const fd = new FormData()
    fd.set('id', deposit.id)
    const res = await confirmDepositAction(fd)
    setPending(false)
    if (res?.error) setError(res.error)
    else setDone('Подтверждено, средства зачислены')
  }

  async function reject() {
    const reason = prompt('Причина отклонения (необязательно):') ?? ''
    setPending(true)
    setError(null)
    const fd = new FormData()
    fd.set('id', deposit.id)
    fd.set('reason', reason)
    const res = await rejectDepositAction(fd)
    setPending(false)
    if (res?.error) setError(res.error)
    else setDone('Заявка отклонена')
  }

  const isCrypto = deposit.method === 'CRYPTO'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{deposit.user.name}</p>
          <p className="text-sm text-muted-foreground">{deposit.user.email}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold">
            {formatMoney(deposit.amount, deposit.currency as 'BYN' | 'USD')}
          </p>
          <span
            className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
              isCrypto ? 'bg-highlight/15 text-highlight' : 'bg-info/15 text-info'
            }`}
          >
            {isCrypto ? `Крипта · ${deposit.asset ?? ''}` : 'ЕРИП'}
          </span>
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Создана</dt>
          <dd>{formatDateTime(deposit.createdAt)}</dd>
        </div>
        {deposit.paymentLink && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Канал ЕРИП</dt>
            <dd>{deposit.paymentLink.label}</dd>
          </div>
        )}
        {deposit.wallet && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Кошелёк</dt>
            <dd className="text-right">
              {deposit.wallet.asset} · {deposit.wallet.network}
            </dd>
          </div>
        )}
        {deposit.reference && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Реквизит</dt>
            <dd className="break-all text-right">{deposit.reference}</dd>
          </div>
        )}
        {deposit.txHash && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Хеш/чек</dt>
            <dd className="flex items-center gap-1.5">
              <span className="max-w-[180px] truncate font-mono text-xs">
                {deposit.txHash}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(deposit.txHash ?? '')}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Скопировать хеш"
              >
                <Copy className="size-3.5" />
              </button>
            </dd>
          </div>
        )}
      </dl>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {done ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success">
          <Check className="size-4" />
          {done}
        </p>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-sm font-semibold text-success-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <Check className="size-4" />
            Подтвердить
          </button>
          <button
            type="button"
            onClick={reject}
            disabled={pending}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <X className="size-4" />
            Отклонить
          </button>
        </div>
      )}
    </div>
  )
}
