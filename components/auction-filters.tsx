'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

const STATUS = [
  { value: 'ACTIVE', label: 'Идут торги' },
  { value: 'SOLD', label: 'Проданные' },
  { value: 'ENDED', label: 'Завершённые' },
  { value: 'ALL', label: 'Все' },
]

const SORT = [
  { value: 'ending', label: 'Скоро завершатся' },
  { value: 'new', label: 'Новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
]

const REGION = [
  { value: '', label: 'Все регионы' },
  { value: 'EU', label: 'Европа' },
  { value: 'US', label: 'США / Канада' },
  { value: 'OTHER', label: 'Другое' },
]

const CURRENCY = [
  { value: '', label: 'Любая валюта' },
  { value: 'BYN', label: 'Рубли (Br)' },
  { value: 'USD', label: 'Крипта (USDT)' },
]

const selectClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary'
const inputClass = selectClass

export function AuctionFilters({ makes = [] }: { makes?: string[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)

  const status = params.get('status') ?? 'ACTIVE'
  const sort = params.get('sort') ?? 'ending'

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString())
    Object.entries(next).forEach(([k, v]) => {
      if (v) sp.set(k, v)
      else sp.delete(k)
    })
    sp.delete('page')
    router.push(`/auctions?${sp.toString()}`)
  }

  const advancedKeys = [
    'region',
    'currency',
    'make',
    'minPrice',
    'maxPrice',
    'minYear',
    'maxYear',
  ]
  const activeAdvanced = advancedKeys.filter((k) => params.get(k)).length

  function resetAdvanced() {
    const sp = new URLSearchParams(params.toString())
    advancedKeys.forEach((k) => sp.delete(k))
    sp.delete('page')
    router.push(`/auctions?${sp.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          update({ q })
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по марке или модели"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => update({ status: s.value })}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              status === s.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            open || activeAdvanced > 0
              ? 'bg-secondary text-secondary-foreground'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="size-4" />
          Фильтры
          {activeAdvanced > 0 && (
            <span className="ml-0.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeAdvanced}
            </span>
          )}
        </button>

        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="ml-auto rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          aria-label="Сортировка"
        >
          {SORT.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Регион
              </span>
              <select
                value={params.get('region') ?? ''}
                onChange={(e) => update({ region: e.target.value })}
                className={selectClass}
              >
                {REGION.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Валюта торгов
              </span>
              <select
                value={params.get('currency') ?? ''}
                onChange={(e) => update({ currency: e.target.value })}
                className={selectClass}
              >
                {CURRENCY.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Марка
              </span>
              <select
                value={params.get('make') ?? ''}
                onChange={(e) => update({ make: e.target.value })}
                className={selectClass}
              >
                <option value="">Все марки</option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <div className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Цена, от / до
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="от"
                  defaultValue={params.get('minPrice') ?? ''}
                  onBlur={(e) => update({ minPrice: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="до"
                  defaultValue={params.get('maxPrice') ?? ''}
                  onBlur={(e) => update({ maxPrice: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Год, от / до
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="от"
                  defaultValue={params.get('minYear') ?? ''}
                  onBlur={(e) => update({ minYear: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="до"
                  defaultValue={params.get('maxYear') ?? ''}
                  onBlur={(e) => update({ maxYear: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-end">
              {activeAdvanced > 0 && (
                <button
                  type="button"
                  onClick={resetAdvanced}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
