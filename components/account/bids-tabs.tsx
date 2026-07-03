'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Flame, ArrowRight } from 'lucide-react'
import { formatBYN, statusLabel } from '@/lib/format'

type Row = {
  lot: {
    id: string
    title: string
    images: string[]
    currentPrice: number
    status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD'
    endsAt: Date
    winnerId: string | null
  }
  myMax: number
  isLeading: boolean
  isWon: boolean
}

type TabKey = 'active' | 'won' | 'lost'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Активные' },
  { key: 'won', label: 'Выигранные' },
  { key: 'lost', label: 'Завершённые' },
]

export function BidsTabs({ rows }: { rows: Row[] }) {
  const [tab, setTab] = useState<TabKey>('active')

  const buckets: Record<TabKey, Row[]> = {
    active: rows.filter((r) => r.lot.status === 'ACTIVE'),
    won: rows.filter((r) => r.isWon),
    lost: rows.filter((r) => r.lot.status !== 'ACTIVE' && !r.isWon),
  }

  const current = buckets[tab]

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              <span
                className={`ml-2 rounded-full px-1.5 text-xs ${
                  active ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}
              >
                {buckets[t.key].length}
              </span>
            </button>
          )
        })}
      </div>

      {current.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">
            {tab === 'active'
              ? 'Нет активных ставок. Найдите автомобиль своей мечты на аукционе.'
              : tab === 'won'
                ? 'Пока нет выигранных лотов. Всё ещё впереди.'
                : 'Здесь появятся завершённые торги, в которых вы участвовали.'}
          </p>
          <Link
            href="/auctions"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Смотреть аукционы
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {current.map((r) => (
            <Link
              key={r.lot.id}
              href={`/auctions/${r.lot.id}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                {r.lot.images[0] && (
                  <Image
                    src={r.lot.images[0]}
                    alt={r.lot.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.lot.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Моя ставка: {formatBYN(r.myMax)} · Текущая:{' '}
                  {formatBYN(r.lot.currentPrice)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {r.isWon ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Trophy className="size-3" /> Выигран
                  </span>
                ) : r.isLeading ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Flame className="size-3" /> Лидирую
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {r.lot.status === 'ACTIVE'
                      ? 'Перебита'
                      : statusLabel(r.lot.status)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
