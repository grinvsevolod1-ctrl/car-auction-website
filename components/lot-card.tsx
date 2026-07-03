import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Calendar, MapPin, Clock } from 'lucide-react'
import { Countdown } from '@/components/countdown'
import {
  formatBYN,
  formatNumber,
  formatDateTime,
  LOT_STATUS_LABEL,
} from '@/lib/format'

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

// Короткий номер лота из id — визуально как на площадках госимущества.
function lotNumber(id: string) {
  return id.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()
}

export function LotCard({ lot }: { lot: LotCardData }) {
  const cover = lot.images[0] || '/cars/placeholder.png'
  const isActive = lot.status === 'ACTIVE'

  return (
    <Link
      href={`/auctions/${lot.id}`}
      className="card-lot group flex flex-col overflow-hidden rounded-md bg-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={cover}
          alt={lot.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute right-2 top-2 rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-foreground/75 text-background'
          }`}
        >
          {LOT_STATUS_LABEL[lot.status] ?? lot.status}
        </span>
        {isActive && (
          <span className="absolute left-2 top-2 rounded-sm bg-highlight px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-highlight-foreground">
            Торги
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="font-mono text-[11px] text-muted-foreground">
          № {lotNumber(lot.id)}
        </p>

        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {lot.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {lot.year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="size-3" />
            {formatNumber(lot.mileage)} км
          </span>
          {lot.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {lot.location}
            </span>
          )}
        </div>

        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {isActive ? 'Приём ставок до ' : 'Завершён '}
          {formatDateTime(lot.endsAt)}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Текущая ставка</p>
            <p className="text-lg font-extrabold text-primary">
              {formatBYN(lot.currentPrice)}
            </p>
          </div>
          {isActive && <Countdown endsAt={lot.endsAt} size="sm" />}
        </div>
      </div>
    </Link>
  )
}
