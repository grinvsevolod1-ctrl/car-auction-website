'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
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

export function AuctionFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')

  const status = params.get('status') ?? 'ACTIVE'
  const sort = params.get('sort') ?? 'ending'

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString())
    Object.entries(next).forEach(([k, v]) => {
      if (v) sp.set(k, v)
      else sp.delete(k)
    })
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
    </div>
  )
}
