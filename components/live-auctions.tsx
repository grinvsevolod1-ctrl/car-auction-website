'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Flame, MapPin, Gauge, Users, Timer, Check } from 'lucide-react'
import { lots as initialLots, type Lot } from '@/lib/auctions'
import { formatBYN, formatCountdown } from '@/lib/format'

type LotState = {
  currentBid: number
  bids: number
  endsInSec: number
  mine: boolean
}

const filters = ['Все лоты', 'Горячие', 'Седаны', 'Внедорожники', 'Электро'] as const

function matchesFilter(lot: Lot, filter: (typeof filters)[number]) {
  switch (filter) {
    case 'Все лоты':
      return true
    case 'Горячие':
      return !!lot.hot
    case 'Внедорожники':
      return ['mercedes-g', 'range-rover'].includes(lot.id)
    case 'Электро':
      return lot.id === 'tesla'
    case 'Седаны':
      return ['bmw-m5', 'audi-rs6', 'porsche-911', 'toyota-camry'].includes(
        lot.id,
      )
    default:
      return true
  }
}

export function LiveAuctions() {
  const [filter, setFilter] =
    useState<(typeof filters)[number]>('Все лоты')

  const [state, setState] = useState<Record<string, LotState>>(() =>
    Object.fromEntries(
      initialLots.map((l) => [
        l.id,
        {
          currentBid: l.currentBid,
          bids: l.bids,
          endsInSec: l.endsInSec,
          mine: false,
        },
      ]),
    ),
  )

  // Global ticker + occasional rival bids for a live feel
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const next: Record<string, LotState> = {}
        for (const lot of initialLots) {
          const cur = prev[lot.id]
          let { currentBid, bids, endsInSec, mine } = cur
          endsInSec = Math.max(0, endsInSec - 1)
          // ~8% chance a rival outbids each second while time remains
          if (endsInSec > 0 && Math.random() < 0.08) {
            currentBid += lot.bidStep
            bids += 1
            mine = false
          }
          next[lot.id] = { currentBid, bids, endsInSec, mine }
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const placeBid = (lot: Lot) => {
    setState((prev) => {
      const cur = prev[lot.id]
      if (cur.endsInSec <= 0) return prev
      return {
        ...prev,
        [lot.id]: {
          ...cur,
          currentBid: cur.currentBid + lot.bidStep,
          bids: cur.bids + 1,
          mine: true,
        },
      }
    })
  }

  const visible = useMemo(
    () => initialLots.filter((l) => matchesFilter(l, filter)),
    [filter],
  )

  return (
    <section id="auctions" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Идут торги
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              Живые аукционы
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Ставки обновляются в реальном времени. Успей перебить конкурентов до
              окончания таймера.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((lot) => {
            const s = state[lot.id]
            const ended = s.endsInSec <= 0
            const t = formatCountdown(s.endsInSec)
            const urgent = s.endsInSec > 0 && s.endsInSec < 15 * 60
            return (
              <article
                key={lot.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <Image
                    src={lot.image || '/placeholder.svg'}
                    alt={lot.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {lot.hot && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                      <Flame className="size-3.5" />
                      Горячий лот
                    </span>
                  )}
                  <span
                    className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur ${
                      ended
                        ? 'bg-background/80 text-muted-foreground'
                        : urgent
                          ? 'bg-destructive/90 text-white'
                          : 'bg-background/80 text-foreground'
                    }`}
                  >
                    <Timer className="size-3.5" />
                    {ended ? 'Завершён' : `${t.h}:${t.m}:${t.s}`}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-bold leading-tight">
                    {lot.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lot.subtitle}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Gauge className="size-4 text-primary" />
                      {lot.mileage}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-4 text-primary" />
                      {lot.location}
                    </span>
                    <span className="col-span-2 text-muted-foreground">
                      {lot.year} · {lot.engine}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Текущая ставка
                      </p>
                      <p className="font-mono text-2xl font-bold text-primary">
                        {formatBYN(s.currentBid)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="size-4" />
                      {s.bids}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => placeBid(lot)}
                    disabled={ended}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-transform ${
                      ended
                        ? 'cursor-not-allowed bg-secondary text-muted-foreground'
                        : s.mine
                          ? 'bg-primary/15 text-primary hover:scale-[1.02]'
                          : 'bg-primary text-primary-foreground hover:scale-[1.02]'
                    }`}
                  >
                    {ended ? (
                      'Торги завершены'
                    ) : s.mine ? (
                      <>
                        <Check className="size-4" />
                        Ваша ставка лидирует
                      </>
                    ) : (
                      <>Поднять на {formatBYN(lot.bidStep)}</>
                    )}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
