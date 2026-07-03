'use client'

import useSWR from 'swr'
import { Trophy } from 'lucide-react'
import { BidForm } from '@/components/bid-form'
import { AutoBidForm } from '@/components/autobid-form'
import { WatchButton } from '@/components/watch-button'
import { Countdown } from '@/components/countdown'
import { formatDateTime, LOT_STATUS_LABEL } from '@/lib/format'
import { formatMoney, type Currency } from '@/lib/money'

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

// Короткий номер лота — как на площадках госимущества.
function lotNumber(id: string) {
  return id.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()
}

export function LiveLotPanel({
  lot,
  currency = 'BYN',
  isAuthenticated,
  isVerified,
  initialWatching,
  autoBidMax,
}: {
  lot: InitialLot
  currency?: Currency
  isAuthenticated: boolean
  isVerified: boolean
  initialWatching: boolean
  autoBidMax: number | null
}) {
  const fmt = (v: number) => formatMoney(v, currency)
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
    <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {/* Бокс отсчёта */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="bg-muted px-5 py-4 text-center">
          {isActive ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                Срок приёма заявок истекает через
              </p>
              <div className="mt-3 flex justify-center">
                <Countdown
                  endsAt={new Date(live.endsAt)}
                  onEnd={() => mutate()}
                />
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              Приём заявок завершён {formatDateTime(new Date(live.endsAt))}
            </p>
          )}
        </div>
      </div>

      {status === 'SOLD' && lot.winnerName && (
        <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 p-4">
          <Trophy className="size-5 text-success" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Лот продан</p>
            <p className="text-muted-foreground">
              Победитель: {maskName(lot.winnerName)}
            </p>
          </div>
        </div>
      )}

      {/* Бокс аукциона: цена и ставки */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between gap-2 bg-primary px-5 py-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary-foreground">
            Аукцион № {lotNumber(lot.id)}
          </h2>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-foreground/85">
              <span className="inline-block size-1.5 animate-pulse-dot rounded-full bg-primary-foreground" />
              вживую
            </span>
          )}
        </div>

        <div className="p-5">
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-2">
              <dt className="text-muted-foreground">Начальная цена</dt>
              <dd className="font-semibold tabular-nums">
                {fmt(lot.startPrice)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-muted-foreground">Текущая ставка</dt>
              <dd className="font-display text-xl font-extrabold tabular-nums text-primary">
                {fmt(live.currentPrice)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-muted-foreground">Сделано ставок</dt>
              <dd className="font-semibold tabular-nums">{live.bidCount}</dd>
            </div>
            {lot.buyNowPrice && (
              <div className="flex items-center justify-between py-2">
                <dt className="text-muted-foreground">Купить сразу</dt>
                <dd className="font-semibold tabular-nums">
                  {fmt(lot.buyNowPrice)}
                </dd>
              </div>
            )}
          </dl>

          {isActive && (
            <div className="mt-4 border-t border-border pt-4">
              <BidForm
                lotId={lot.id}
                currentPrice={live.currentPrice}
                bidStep={live.bidStep}
                isAuthenticated={isAuthenticated}
                isVerified={isVerified}
                onBidPlaced={() => mutate()}
              />
              {isAuthenticated && isVerified && (
                <AutoBidForm
                  lotId={lot.id}
                  minMax={live.currentPrice + live.bidStep}
                  currentMax={autoBidMax}
                />
              )}
            </div>
          )}

          <div className="mt-4">
            <WatchButton
              lotId={lot.id}
              initialWatching={initialWatching}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      {/* История ставок */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border bg-muted px-5 py-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide">
            История ставок
          </h3>
        </div>
        <div className="p-5">
          {live.bids.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ставок пока нет. Будьте первым!
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {live.bids.map((bid) => (
                <li
                  key={bid.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-muted-foreground">
                    {maskName(bid.name)}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {fmt(bid.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
