'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import type { LotFormState } from '@/lib/actions/lots'

type Lot = {
  id: string
  title: string
  make: string
  model: string
  year: number
  mileage: number
  engineVol: number | null
  power: number | null
  transmission: string | null
  bodyType: string | null
  fuelType: string | null
  drive: string | null
  color: string | null
  vin: string | null
  location: string | null
  condition: string | null
  description: string | null
  images: string[]
  startPrice: number
  bidStep: number
  buyNowPrice: number | null
  status: string
  endsAt: Date
}

function toLocalInput(date: Date) {
  const d = new Date(date)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

function Field({
  label,
  name,
  children,
  hint,
}: {
  label: string
  name: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Сохранение…' : label}
    </button>
  )
}

export function LotForm({
  action,
  lot,
  submitLabel,
}: {
  action: (state: LotFormState, formData: FormData) => Promise<LotFormState>
  lot?: Lot
  submitLabel: string
}) {
  const [state, formAction] = useActionState<LotFormState, FormData>(action, {})

  const defaultEnds = lot
    ? toLocalInput(lot.endsAt)
    : toLocalInput(new Date(Date.now() + 7 * 86400000))

  return (
    <form action={formAction} className="space-y-8">
      {/* Основное */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">
          Основное
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Заголовок лота" name="title">
              <input
                id="title"
                name="title"
                defaultValue={lot?.title}
                required
                className={inputClass}
                placeholder="BMW M5 Competition, 2021"
              />
            </Field>
          </div>
          <Field label="Марка" name="make">
            <input id="make" name="make" defaultValue={lot?.make} required className={inputClass} placeholder="BMW" />
          </Field>
          <Field label="Модель" name="model">
            <input id="model" name="model" defaultValue={lot?.model} required className={inputClass} placeholder="M5" />
          </Field>
          <Field label="Год выпуска" name="year">
            <input id="year" name="year" type="number" defaultValue={lot?.year} required className={inputClass} placeholder="2021" />
          </Field>
          <Field label="Пробег, км" name="mileage">
            <input id="mileage" name="mileage" type="number" defaultValue={lot?.mileage} required className={inputClass} placeholder="45000" />
          </Field>
        </div>
      </section>

      {/* Характеристики */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">
          Характеристики
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Объём двигателя, л" name="engineVol">
            <input id="engineVol" name="engineVol" type="number" step="0.1" defaultValue={lot?.engineVol ?? ''} className={inputClass} placeholder="4.4" />
          </Field>
          <Field label="Мощность, л.с." name="power">
            <input id="power" name="power" type="number" defaultValue={lot?.power ?? ''} className={inputClass} placeholder="625" />
          </Field>
          <Field label="Коробка передач" name="transmission">
            <input id="transmission" name="transmission" defaultValue={lot?.transmission ?? ''} className={inputClass} placeholder="Автомат" />
          </Field>
          <Field label="Тип кузова" name="bodyType">
            <input id="bodyType" name="bodyType" defaultValue={lot?.bodyType ?? ''} className={inputClass} placeholder="Седан" />
          </Field>
          <Field label="Топливо" name="fuelType">
            <input id="fuelType" name="fuelType" defaultValue={lot?.fuelType ?? ''} className={inputClass} placeholder="Бензин" />
          </Field>
          <Field label="Привод" name="drive">
            <input id="drive" name="drive" defaultValue={lot?.drive ?? ''} className={inputClass} placeholder="Полный" />
          </Field>
          <Field label="Цвет" name="color">
            <input id="color" name="color" defaultValue={lot?.color ?? ''} className={inputClass} placeholder="Чёрный" />
          </Field>
          <Field label="VIN" name="vin">
            <input id="vin" name="vin" defaultValue={lot?.vin ?? ''} className={inputClass} placeholder="WBSJF0C5..." />
          </Field>
          <Field label="Город / регион" name="location">
            <input id="location" name="location" defaultValue={lot?.location ?? ''} className={inputClass} placeholder="Минск" />
          </Field>
          <Field label="Состояние" name="condition">
            <input id="condition" name="condition" defaultValue={lot?.condition ?? ''} className={inputClass} placeholder="Отличное" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Описание" name="description">
            <textarea id="description" name="description" defaultValue={lot?.description ?? ''} rows={5} className={inputClass} placeholder="Комплектация, история обслуживания, особенности..." />
          </Field>
        </div>
      </section>

      {/* Фото */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">
          Фотографии
        </h2>
        <div className="mt-4">
          <Field
            label="URL изображений"
            name="images"
            hint="По одному URL на строку (или через запятую). Первое фото — главное."
          >
            <textarea
              id="images"
              name="images"
              defaultValue={lot?.images.join('\n')}
              rows={4}
              className={inputClass}
              placeholder="https://example.com/car-1.jpg&#10;https://example.com/car-2.jpg"
            />
          </Field>
        </div>
      </section>

      {/* Торги */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">
          Параметры торгов
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Стартовая цена, Br" name="startPrice">
            <input id="startPrice" name="startPrice" type="number" defaultValue={lot?.startPrice} required className={inputClass} placeholder="50000" />
          </Field>
          <Field label="Шаг ставки, Br" name="bidStep">
            <input id="bidStep" name="bidStep" type="number" defaultValue={lot?.bidStep ?? 500} required className={inputClass} placeholder="500" />
          </Field>
          <Field label="Цена «купить сразу», Br" name="buyNowPrice" >
            <input id="buyNowPrice" name="buyNowPrice" type="number" defaultValue={lot?.buyNowPrice ?? ''} className={inputClass} placeholder="Необязательно" />
          </Field>
          <Field label="Статус" name="status">
            <select id="status" name="status" defaultValue={lot?.status ?? 'DRAFT'} className={inputClass}>
              <option value="DRAFT">Черновик</option>
              <option value="ACTIVE">Идут торги</option>
              <option value="ENDED">Завершён</option>
              <option value="SOLD">Продан</option>
            </select>
          </Field>
          <Field label="Окончание торгов" name="endsAt">
            <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={defaultEnds} required className={inputClass} />
          </Field>
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/admin/lots"
          className="rounded-xl border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Отмена
        </Link>
      </div>
    </form>
  )
}
