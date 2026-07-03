'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { loginAction, registerAction, type AuthState } from '@/lib/actions/auth'
import { Logo } from '@/components/logo'

const inputCls =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

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

  // Максимально допустимая дата рождения — 18 лет назад от сегодня.
  const maxBirth = new Date()
  maxBirth.setFullYear(maxBirth.getFullYear() - 18)
  const maxBirthStr = maxBirth.toISOString().slice(0, 10)

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
              Имя и фамилия
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              defaultValue={state.values?.name}
              className={inputCls}
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
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>

        {!isLogin && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                Телефон
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className={inputCls}
                placeholder="+375 29 …"
              />
            </div>
            <div>
              <label htmlFor="birthDate" className="mb-1.5 block text-sm font-medium">
                Дата рождения
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                max={maxBirthStr}
                className={inputCls}
              />
            </div>
          </div>
        )}

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
            className={inputCls}
            placeholder={isLogin ? 'Ваш пароль' : 'Минимум 8 символов'}
          />
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
              Повторите пароль
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              className={inputCls}
              placeholder="Ещё раз пароль"
            />
          </div>
        )}

        {!isLogin && (
          <div className="mb-2 space-y-2.5 rounded-xl bg-muted/50 p-3">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                name="ageConfirm"
                required
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span>
                Мне исполнилось <b>18 лет</b>, и я вправе участвовать в торгах.
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span>
                Я согласен с{' '}
                <Link href="/rules" className="font-medium text-primary hover:underline" target="_blank">
                  правилами площадки
                </Link>{' '}
                и обработкой персональных данных.
              </span>
            </label>
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
