'use client'

import { useActionState } from 'react'
import {
  saveSettingsAction,
  type SimpleFormState,
} from '@/lib/actions/admin-payments'
import { Save } from 'lucide-react'

type Fields = Record<string, string>

const GROUPS: {
  title: string
  fields: { key: string; label: string; hint?: string; textarea?: boolean }[]
}[] = [
  {
    title: 'Крипта и курс',
    fields: [
      {
        key: 'crypto_discount_pct',
        label: 'Скидка при оплате криптой, %',
        hint: 'Скидка на растаможку и сборы при оплате в крипте',
      },
      { key: 'usd_to_byn', label: 'Курс USDT → BYN', hint: 'Сколько Br за 1 USDT' },
    ],
  },
  {
    title: 'Растаможка и сборы',
    fields: [
      { key: 'customs_duty_pct', label: 'Таможенная пошлина, %' },
      { key: 'customs_vat_pct', label: 'НДС на ввоз, %' },
      { key: 'customs_util_fee', label: 'Утилизационный сбор, Br' },
      { key: 'service_fee_pct', label: 'Сервисный сбор площадки, %' },
      { key: 'shipping_us', label: 'Доставка из США, Br' },
      { key: 'shipping_eu', label: 'Доставка из Европы, Br' },
    ],
  },
  {
    title: 'Инструкции для пользователей',
    fields: [
      { key: 'erip_instructions', label: 'Инструкция ЕРИП', textarea: true },
      { key: 'crypto_instructions', label: 'Инструкция по крипте', textarea: true },
      { key: 'operator_telegram', label: 'Telegram оператора' },
    ],
  },
]

const initial: SimpleFormState = {}

export function SettingsForm({ values }: { values: Fields }) {
  const [state, action, pending] = useActionState(saveSettingsAction, initial)

  return (
    <form action={action} className="space-y-6">
      {GROUPS.map((g) => (
        <section key={g.title} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">{g.title}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
                <label className="mb-1 block text-sm font-medium">{f.label}</label>
                {f.textarea ? (
                  <textarea
                    name={f.key}
                    defaultValue={values[f.key] ?? ''}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    name={f.key}
                    defaultValue={values[f.key] ?? ''}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                )}
                {f.hint && (
                  <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Save className="size-4" />
          Сохранить настройки
        </button>
        {state.success && <p className="text-sm text-success">{state.success}</p>}
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  )
}
