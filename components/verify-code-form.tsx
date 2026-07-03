'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import {
  verifyEmailCodeAction,
  resendEmailCodeAction,
  type SimpleState,
} from '@/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Проверяем…' : 'Подтвердить'}
    </button>
  )
}

export function VerifyCodeForm({ email }: { email: string }) {
  const router = useRouter()
  const [state, formAction] = useActionState<SimpleState, FormData>(
    verifyEmailCodeAction,
    {},
  )
  const [resendState, resendAction] = useActionState<SimpleState, FormData>(
    async () => resendEmailCodeAction(),
    {},
  )

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push('/account'), 1200)
      return () => clearTimeout(t)
    }
  }, [state.success, router])

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
      <h1 className="text-center font-display text-2xl font-bold uppercase tracking-tight">
        Подтверждение почты
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">
        Мы отправили 6-значный код на <b>{email}</b>. Введите его ниже, чтобы
        активировать аккаунт.
      </p>

      <form action={formAction} className="mt-6">
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
          Код из письма
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="000000"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {state.error && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            {state.success}. Перенаправляем…
          </p>
        )}

        <SubmitButton />
      </form>

      <form action={resendAction} className="mt-4 text-center">
        <button
          type="submit"
          className="text-sm font-medium text-primary hover:underline"
        >
          Отправить код повторно
        </button>
        {resendState.success && (
          <p className="mt-2 text-sm text-success">{resendState.success}</p>
        )}
        {resendState.error && (
          <p className="mt-2 text-sm text-destructive">{resendState.error}</p>
        )}
      </form>
    </div>
  )
}
