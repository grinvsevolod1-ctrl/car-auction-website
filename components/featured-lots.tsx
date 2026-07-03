import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LotCard, type LotCardData } from '@/components/lot-card'

export function FeaturedLots({ lots }: { lots: LotCardData[] }) {
  return (
    <section id="auctions" className="scroll-mt-16 border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary">Живые торги</span>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              Актуальные лоты
            </h2>
            <p className="mt-3 text-muted-foreground">
              Автомобили, по которым прямо сейчас идут торги. Успейте сделать
              ставку до конца аукциона.
            </p>
          </div>
          <Link
            href="/auctions"
            className="group inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Все аукционы
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {lots.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-xl font-bold">Активных торгов пока нет</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Загляните позже — новые лоты появляются регулярно.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
