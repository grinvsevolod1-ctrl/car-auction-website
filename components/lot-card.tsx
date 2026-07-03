import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { formatDateTime, LOT_STATUS_LABEL } from '@/lib/format'
import { formatMoney, type Currency } from '@/lib/money'

const REGION_LABEL: Record<string, string> = {
  EU: 'Европа',
  US: 'США',
  OTHER: 'Импорт',
}

export type LotCardData = {
  id: string
  title: string
  year: number
  mileage: number
  location: string | null
  images: string[]
  currentPrice: number
  currency?: Currency
  originCountry?: string | null
  region?: string | null
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
          className={`absolute right-0 top-2 rounded-l-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-foreground/75 text-background'
          }`}
        >
          {LOT_STATUS_LABEL[lot.status] ?? lot.status}
        </span>
        {lot.region && REGION_LABEL[lot.region] && (
          <span className="absolute left-0 top-2 rounded-r-sm bg-background/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground">
            {REGION_LABEL[lot.region]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center p-3 text-center">
        <p className="font-mono text-[11px] font-semibold text-primary">
          № {lotNumber(lot.id)}
        </p>

        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {lot.title}
        </h3>

        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {isActive ? 'Приём заявок до ' : 'Завершён '}
          {formatDateTime(lot.endsAt)}
        </p>

        <div className="mt-auto flex w-full items-center justify-center gap-2 pt-3">
          <Heart className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-lg font-extrabold tabular-nums text-foreground">
            {formatMoney(lot.currentPrice, lot.currency ?? 'BYN')}
          </span>
        </div>
      </div>
    </Link>
  )
}
