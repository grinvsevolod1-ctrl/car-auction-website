'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { deleteLotAction, finalizeLotAction } from '@/lib/actions/lots'
import { Pencil, Trash2, Flag } from 'lucide-react'

function IconSubmit({
  children,
  title,
  danger,
  confirmText,
}: {
  children: React.ReactNode
  title: string
  danger?: boolean
  confirmText?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      title={title}
      disabled={pending}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault()
      }}
      className={
        'grid size-9 place-items-center rounded-lg border border-border transition-colors disabled:opacity-50 ' +
        (danger
          ? 'text-destructive hover:bg-destructive/10 hover:border-destructive/40'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground')
      }
    >
      {children}
    </button>
  )
}

export function LotRowActions({
  id,
  canFinalize,
}: {
  id: string
  canFinalize: boolean
}) {
  const [busy] = useState(false)

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/lots/${id}`}
        title="Редактировать"
        className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-4" />
      </Link>

      {canFinalize && (
        <form action={finalizeLotAction}>
          <input type="hidden" name="id" value={id} />
          <IconSubmit
            title="Завершить торги"
            confirmText="Завершить торги и назначить победителя по максимальной ставке?"
          >
            <Flag className="size-4" />
          </IconSubmit>
        </form>
      )}

      <form action={deleteLotAction}>
        <input type="hidden" name="id" value={id} />
        <IconSubmit
          title="Удалить"
          danger
          confirmText="Удалить лот безвозвратно? Все ставки по нему тоже будут удалены."
        >
          <Trash2 className="size-4" />
        </IconSubmit>
      </form>

      {busy && null}
    </div>
  )
}
