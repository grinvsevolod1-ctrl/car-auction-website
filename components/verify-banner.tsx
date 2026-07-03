'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { MailWarning, CheckCircle2 } from 'lucide-react'
import { resendVerificationAction, type SimpleState } from '@/lib/actions/auth'

function ResendButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg border border-primary/40 bg-background px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
    >
      {pending ? 'Отправка…' : 'Отправить письмо повторно'}
    </button>
  )
}

export function VerifyBanner() {
  const [state, action] = useActionState<SimpleState, FormData>(
    resendVerificationAction,
    {},
  )

  return (
    <form
      action={action}
      className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            Подтвердите email, чтобы делать ставки
          </p>
          <p className="text-muted-foreground">
            {state.success ? (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="size-4" />
                {state.success}
              </span>
            ) : state.error ? (
              <span className="text-destructive">{state.error}</span>
            ) : (
              'Мы отправили ссылку на вашу почту при регистрации.'
            )}
          </p>
        </div>
      </div>
      <ResendButton />
    </form>
  )
}
