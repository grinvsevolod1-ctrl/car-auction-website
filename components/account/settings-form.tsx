'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import {
  updateProfileAction,
  changePasswordAction,
  type SimpleState,
} from '@/lib/actions/auth'

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {pending ? 'Сохранение…' : label}
    </button>
  )
}

function Feedback({ state }: { state: SimpleState }) {
  if (state.success) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
        <CheckCircle2 className="size-4" />
        {state.success}
      </p>
    )
  }
  if (state.error) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <AlertCircle className="size-4" />
        {state.error}
      </p>
    )
  }
  return null
}

export function SettingsForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string
  defaultPhone: string
}) {
  const [profileState, profileAction] = useActionState<SimpleState, FormData>(
    updateProfileAction,
    {},
  )
  const [pwState, pwAction] = useActionState<SimpleState, FormData>(
    changePasswordAction,
    {},
  )

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">
          Профиль
        </h2>
        <form action={profileAction} className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Имя
            </label>
            <input
              id="name"
              name="name"
              defaultValue={defaultName}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Телефон
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={defaultPhone}
              placeholder="+375 (29) 000-00-00"
              className={inputClass}
            />
          </div>
          <Feedback state={profileState} />
          <SaveButton label="Сохранить профиль" />
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">
          Смена пароля
        </h2>
        <form action={pwAction} className="mt-4 space-y-4">
          <div>
            <label htmlFor="current" className="mb-1.5 block text-sm font-medium">
              Текущий пароль
            </label>
            <input
              id="current"
              name="current"
              type="password"
              required
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="next" className="mb-1.5 block text-sm font-medium">
              Новый пароль
            </label>
            <input
              id="next"
              name="next"
              type="password"
              required
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
              Повторите новый пароль
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <Feedback state={pwState} />
          <SaveButton label="Изменить пароль" />
        </form>
      </section>
    </div>
  )
}
