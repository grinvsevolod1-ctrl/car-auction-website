'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { loginAction, registerAction, type AuthState } from '@/lib/actions/auth'
import { Logo } from '@/components/logo'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Подождите…' : label}
    </button>
  )
}

export function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const isLogin = mode === 'login'
  const action = isLogin ? loginAction : registerAction
  const [state, formAction] = useActionState<AuthState, FormData>(action, {})

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Logo />
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
            {isLogin ? 'Вход в кабинет' : 'Регистрация'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin
              ? 'Войдите, чтобы участвовать в торгах и отслеживать ставки.'
              : 'Создайте аккаунт — это обязательно для участия в аукционах.'}
          </p>
        </div>
      </div>

      <form action={formAction} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {isLogin && next && <input type="hidden" name="next" value={next} />}

        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              defaultValue={state.values?.name}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Иван Петров"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder={isLogin ? 'Ваш пароль' : 'Минимум 8 символов'}
          />
        </div>

        {!isLogin && (
          <div className="mb-2">
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
              Повторите пароль
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ещё раз пароль"
            />
          </div>
        )}

        {state.error && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmitButton label={isLogin ? 'Войти' : 'Создать аккаунт'} />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Нет аккаунта?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </>
        ) : (
          <>
            Уже есть аккаунт?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Войти
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
