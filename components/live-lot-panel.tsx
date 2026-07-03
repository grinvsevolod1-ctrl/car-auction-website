'use client'

import useSWR from 'swr'
import { Trophy } from 'lucide-react'
import { BidForm } from '@/components/bid-form'
import { Countdown } from '@/components/countdown'
import { formatBYN, formatDateTime, LOT_STATUS_LABEL } from '@/lib/format'

type LiveData = {
  currentPrice: number
  bidStep: number
  status: string
  isActive: boolean
  endsAt: string
  bidCount: number
  bids: { id: string; amount: number; name: string; createdAt: string }[]
}

type InitialLot = {
  id: string
  title: string
  status: string
  startPrice: number
  currentPrice: number
  bidStep: number
  buyNowPrice: number | null
  endsAt: string
  bidCount: number
  bids: { id: string; amount: number; name: string }[]
  winnerName: string | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function maskName(name: string) {
  return name
    .trim()
    .split(' ')
    .map((p) => (p ? p[0].toUpperCase() + '***' : ''))
    .join(' ')
}

export function LiveLotPanel({
  lot,
  isAuthenticated,
  isVerified,
}: {
  lot: InitialLot
  isAuthenticated: boolean
  isVerified: boolean
}) {
  const { data, mutate } = useSWR<LiveData>(`/api/lots/${lot.id}`, fetcher, {
    refreshInterval: 5000,
    fallbackData: {
      currentPrice: lot.currentPrice,
      bidStep: lot.bidStep,
      status: lot.status,
      isActive:
        lot.status === 'ACTIVE' && new Date(lot.endsAt).getTime() > Date.now(),
      endsAt: lot.endsAt,
      bidCount: lot.bidCount,
      bids: lot.bids.map((b) => ({ ...b, createdAt: '' })),
    },
  })

  const live = data!
  const isActive = live.isActive
  const status = live.status

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isActive && (
          <span className="inline-block size-1.5 animate-pulse-dot rounded-full bg-primary-foreground" />
        )}
        {LOT_STATUS_LABEL[status] ?? status}
      </span>

      <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-balance">
        {lot.title}
      </h1>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Текущая ставка</p>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block size-1.5 animate-pulse-dot rounded-full bg-success" />
              обновляется вживую
            </span>
          )}
        </div>
        <p className="font-display text-4xl font-bold text-primary tabular-nums">
          {formatBYN(live.currentPrice)}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          <span>Старт: {formatBYN(lot.startPrice)}</span>
          <span>Ставок: {live.bidCount}</span>
          {lot.buyNowPrice && (
            <span>Купить сразу: {formatBYN(lot.buyNowPrice)}</span>
          )}
        </div>

        {isActive ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs text-muted-foreground">
              До завершения торгов
            </p>
            <Countdown endsAt={new Date(live.endsAt)} onEnd={() => mutate()} />
          </div>
        ) : (
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Завершён {formatDateTime(new Date(live.endsAt))}
          </p>
        )}
      </div>

      {status === 'SOLD' && lot.winnerName && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
          <Trophy className="size-5 text-success" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Лот продан</p>
            <p className="text-muted-foreground">
              Победитель: {maskName(lot.winnerName)}
            </p>
          </div>
        </div>
      )}

      {isActive && (
        <div className="mt-4">
          <BidForm
            lotId={lot.id}
            currentPrice={live.currentPrice}
            bidStep={live.bidStep}
            isAuthenticated={isAuthenticated}
            isVerified={isVerified}
            onBidPlaced={() => mutate()}
          />
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold">История ставок</h3>
        {live.bids.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Ставок пока нет. Будьте первым!
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {live.bids.map((bid) => (
              <li
                key={bid.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-muted-foreground">
                  {maskName(bid.name)}
                </span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatBYN(bid.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
