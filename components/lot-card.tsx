import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Calendar, MapPin } from 'lucide-react'
import { Countdown } from '@/components/countdown'
import { formatBYN, formatNumber, LOT_STATUS_LABEL } from '@/lib/format'

export type LotCardData = {
  id: string
  title: string
  year: number
  mileage: number
  location: string | null
  images: string[]
  currentPrice: number
  status: string
  endsAt: Date | string
  _count?: { bids: number }
}

export function LotCard({ lot }: { lot: LotCardData }) {
  const cover = lot.images[0] ?? '/cars/placeholder.png'
  const isActive = lot.status === 'ACTIVE'

  return (
    <Link
      href={`/auctions/${lot.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={cover || "/placeholder.svg"}
          alt={lot.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-foreground/80 text-background'
          }`}
        >
          {isActive && (
            <span className="mr-1.5 inline-block size-1.5 animate-pulse-dot rounded-full bg-primary-foreground align-middle" />
          )}
          {LOT_STATUS_LABEL[lot.status] ?? lot.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold leading-tight text-balance">
          {lot.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {lot.year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="size-3.5" />
            {formatNumber(lot.mileage)} км
          </span>
          {lot.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {lot.location}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Текущая ставка</p>
            <p className="font-display text-xl font-bold text-primary">
              {formatBYN(lot.currentPrice)}
            </p>
            {typeof lot._count?.bids === 'number' && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ставок: {lot._count.bids}
              </p>
            )}
          </div>
          {isActive && <Countdown endsAt={lot.endsAt} size="sm" />}
        </div>
      </div>
    </Link>
  )
}
