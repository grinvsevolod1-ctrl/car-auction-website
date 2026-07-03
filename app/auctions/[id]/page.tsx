import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LotGallery } from '@/components/lot-gallery'
import { BidForm } from '@/components/bid-form'
import { Countdown } from '@/components/countdown'
import { getLotDetail } from '@/lib/queries'
import { getSession } from '@/lib/auth/session'
import {
  formatBYN,
  formatDateTime,
  formatNumber,
  LOT_STATUS_LABEL,
} from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const lot = await getLotDetail(id)
  return { title: lot?.title ?? 'Лот' }
}

function maskName(name: string) {
  const parts = name.trim().split(' ')
  return parts
    .map((p) => (p ? p[0].toUpperCase() + '***' : ''))
    .join(' ')
}

export default async function LotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [lot, session] = await Promise.all([getLotDetail(id), getSession()])

  if (!lot || lot.status === 'DRAFT') notFound()

  const isActive = lot.status === 'ACTIVE' && lot.endsAt.getTime() > Date.now()

  const specs: { label: string; value: string | number | null }[] = [
    { label: 'Марка', value: lot.make },
    { label: 'Модель', value: lot.model },
    { label: 'Год выпуска', value: lot.year },
    { label: 'Пробег', value: `${formatNumber(lot.mileage)} км` },
    { label: 'Двигатель', value: lot.engineVol ? `${lot.engineVol} л` : null },
    { label: 'Мощность', value: lot.power ? `${lot.power} л.с.` : null },
    { label: 'КПП', value: lot.transmission },
    { label: 'Кузов', value: lot.bodyType },
    { label: 'Топливо', value: lot.fuelType },
    { label: 'Привод', value: lot.drive },
    { label: 'Цвет', value: lot.color },
    { label: 'VIN', value: lot.vin },
    { label: 'Регион', value: lot.location },
    { label: 'Состояние', value: lot.condition },
  ].filter((s) => s.value !== null && s.value !== '')

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            href="/auctions"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Ко всем аукционам
          </Link>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* Левая колонка */}
            <div>
              <LotGallery images={lot.images} title={lot.title} />

              <div className="mt-8">
                <h2 className="font-display text-2xl font-bold">Характеристики</h2>
                <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
                  {specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex justify-between gap-4 border-b border-border py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="text-right font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {lot.description && (
                <div className="mt-8">
                  <h2 className="font-display text-2xl font-bold">Описание</h2>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {lot.description}
                  </p>
                </div>
              )}
            </div>

            {/* Правая колонка */}
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
                {LOT_STATUS_LABEL[lot.status]}
              </span>

              <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-balance">
                {lot.title}
              </h1>

              <div className="mt-5 rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Текущая ставка</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {formatBYN(lot.currentPrice)}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                  <span>Старт: {formatBYN(lot.startPrice)}</span>
                  <span>Ставок: {lot._count.bids}</span>
                  {lot.buyNowPrice && (
                    <span>Купить сразу: {formatBYN(lot.buyNowPrice)}</span>
                  )}
                </div>

                {isActive ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      До завершения торгов
                    </p>
                    <Countdown endsAt={lot.endsAt} />
                  </div>
                ) : (
                  <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    Завершён {formatDateTime(lot.endsAt)}
                  </p>
                )}
              </div>

              {lot.status === 'SOLD' && lot.winner && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
                  <Trophy className="size-5 text-success" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Лот продан</p>
                    <p className="text-muted-foreground">
                      Победитель: {maskName(lot.winner.name)}
                    </p>
                  </div>
                </div>
              )}

              {isActive && (
                <div className="mt-4">
                  <BidForm
                    lotId={lot.id}
                    currentPrice={lot.currentPrice}
                    bidStep={lot.bidStep}
                    isAuthenticated={Boolean(session)}
                  />
                </div>
              )}

              {/* История ставок */}
              <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display text-lg font-bold">История ставок</h3>
                {lot.bids.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ставок пока нет. Будьте первым!
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-border">
                    {lot.bids.map((bid) => (
                      <li
                        key={bid.id}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {maskName(bid.user.name)}
                        </span>
                        <span className="font-mono font-semibold">
                          {formatBYN(bid.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
