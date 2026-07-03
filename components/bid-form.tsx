'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Gavel, CheckCircle2, AlertCircle } from 'lucide-react'
import { placeBidAction, type BidState } from '@/lib/actions/bids'
import { formatBYN } from '@/lib/format'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      <Gavel className="size-4" />
      {pending ? 'Отправка...' : 'Сделать ставку'}
    </button>
  )
}

export function BidForm({
  lotId,
  currentPrice,
  bidStep,
  isAuthenticated,
}: {
  lotId: string
  currentPrice: number
  bidStep: number
  isAuthenticated: boolean
}) {
  const minBid = currentPrice + bidStep
  const [state, formAction] = useActionState<BidState, FormData>(
    placeBidAction,
    {},
  )
  const [amount, setAmount] = useState<number>(minBid)

  useEffect(() => {
    setAmount(minBid)
  }, [minBid])

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Чтобы участвовать в торгах, войдите в аккаунт или зарегистрируйтесь.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href={`/login?next=/auctions/${lotId}`}
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold hover:bg-muted"
          >
            Регистрация
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <input type="hidden" name="lotId" value={lotId} />

      <label
        htmlFor="amount"
        className="text-sm font-medium text-foreground"
      >
        Ваша ставка
      </label>
      <p className="mt-1 text-xs text-muted-foreground">
        Минимум: {formatBYN(minBid)} (шаг {formatBYN(bidStep)})
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAmount((a) => Math.max(minBid, a - bidStep))}
          className="size-11 shrink-0 rounded-xl border border-border text-lg font-semibold hover:bg-muted"
          aria-label="Уменьшить"
        >
          −
        </button>
        <div className="relative flex-1">
          <input
            id="amount"
            name="amount"
            type="number"
            min={minBid}
            step={bidStep}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-center font-mono text-lg font-semibold outline-none focus:border-primary"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            Br
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAmount((a) => a + bidStep)}
          className="size-11 shrink-0 rounded-xl border border-border text-lg font-semibold hover:bg-muted"
          aria-label="Увеличить"
        >
          +
        </button>
      </div>

      <div className="mt-4">
        <SubmitButton />
      </div>

      {state.error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {state.success}
        </p>
      )}
    </form>
  )
}
