'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitKycAction, type KycState } from '@/lib/actions/kyc'

const inputCls =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

type Defaults = {
  firstName?: string | null
  lastName?: string | null
  middleName?: string | null
  birthDate?: string | null
  passportNumber?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
  occupation?: string | null
  sourceOfFunds?: string | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Отправляем…' : 'Отправить анкету на проверку'}
    </button>
  )
}

function Field({
  name,
  label,
  defaultValue,
  type = 'text',
  required = true,
  placeholder,
}: {
  name: string
  label: string
  defaultValue?: string | null
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  )
}

export function KycForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useActionState<KycState, FormData>(
    submitKycAction,
    {},
  )

  const maxBirth = new Date()
  maxBirth.setFullYear(maxBirth.getFullYear() - 18)
  const maxBirthStr = maxBirth.toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="lastName" label="Фамилия" defaultValue={defaults.lastName} />
        <Field name="firstName" label="Имя" defaultValue={defaults.firstName} />
        <Field
          name="middleName"
          label="Отчество"
          defaultValue={defaults.middleName}
          required={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            defaultValue={defaults.birthDate ?? ''}
            className={inputCls}
          />
        </div>
        <Field
          name="passportNumber"
          label="Номер паспорта / ID"
          defaultValue={defaults.passportNumber}
          placeholder="MP1234567"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="country" label="Страна" defaultValue={defaults.country} placeholder="Беларусь" />
        <Field name="city" label="Город" defaultValue={defaults.city} />
        <Field name="phone" label="Телефон" type="tel" defaultValue={defaults.phone} placeholder="+375 29 …" />
      </div>

      <Field name="address" label="Адрес регистрации" defaultValue={defaults.address} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="occupation"
          label="Род деятельности"
          defaultValue={defaults.occupation}
          required={false}
        />
        <Field
          name="sourceOfFunds"
          label="Источник средств"
          defaultValue={defaults.sourceOfFunds}
          required={false}
          placeholder="Зарплата, бизнес…"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-muted/50 p-3 text-sm">
        <input type="checkbox" name="ageConfirmed" required className="mt-0.5 size-4 shrink-0 accent-primary" />
        <span>
          Подтверждаю, что мне исполнилось <b>18 лет</b>, данные достоверны и
          принадлежат мне.
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
