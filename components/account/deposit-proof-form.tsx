'use client'

import { attachDepositProofAction } from '@/lib/actions/deposits'

export function DepositProofForm({
  id,
  defaultNote,
}: {
  id: string
  defaultNote?: string | null
}) {
  return (
    <form action={attachDepositProofAction} className="mt-2 flex gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="note"
        defaultValue={defaultNote ?? ''}
        placeholder="Хэш транзакции или комментарий"
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
      >
        Сохранить
      </button>
    </form>
  )
}
