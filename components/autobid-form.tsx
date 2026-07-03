'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Bot, Check } from 'lucide-react'
import {
  setAutoBidAction,
  cancelAutoBidAction,
  type AutoBidState,
} from '@/lib/actions/autobid'
import { formatBYN } from '@/lib/format'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Сохраняем…' : label}
    </button>
  )
}

export function AutoBidForm({
  lotId,
  minMax,
  currentMax,
}: {
  lotId: string
  minMax: number
  currentMax: number | null
}) {
  const [open, setOpen] = useState(false)
  const [setState, setAction] = useActionState<AutoBidState, FormData>(
    setAutoBidAction,
    {},
  )
  const [cancelState, cancelAction] = useActionState<AutoBidState, FormData>(
    cancelAutoBidAction,
    {},
  )

  if (currentMax && !open) {
    return (
      <div className="mt-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <Bot className="size-4 text-primary" />
          <span className="font-semibold">Автоставка включена</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Система ставит за вас до {formatBYN(currentMax)}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Изменить лимит
          </button>
          <form action={cancelAction}>
            <input type="hidden" name="lotId" value={lotId} />
            <button
              type="submit"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-destructive hover:bg-muted"
            >
              Отключить
            </button>
          </form>
        </div>
        {cancelState.error && (
          <p className="mt-2 text-xs text-destructive">{cancelState.error}</p>
        )}
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <Bot className="size-4" />
        Включить автоставку
      </button>
    )
  }

  return (
    <form
      action={setAction}
      className="mt-3 rounded-2xl border border-border bg-card p-4"
    >
      <input type="hidden" name="lotId" value={lotId} />
      <label
        htmlFor="maxAmount"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <Bot className="size-4 text-primary" />
        Максимальная автоставка
      </label>
      <p className="mt-1 text-xs text-muted-foreground">
        Система будет автоматически перебивать конкурентов минимальным шагом, но
        не выше указанной суммы.
      </p>
      <input
        id="maxAmount"
        name="maxAmount"
        type="number"
        min={minMax}
        defaultValue={currentMax ?? minMax}
        step={1}
        className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Минимум: {formatBYN(minMax)}
      </p>
      {setState.error && (
        <p className="mt-2 text-xs text-destructive">{setState.error}</p>
      )}
      {setState.success && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-success">
          <Check className="size-3" /> {setState.success}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <SubmitButton label={currentMax ? 'Обновить' : 'Включить'} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
