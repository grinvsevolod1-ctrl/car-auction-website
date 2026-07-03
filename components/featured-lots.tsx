import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LotCard, type LotCardData } from '@/components/lot-card'

export function FeaturedLots({ lots }: { lots: LotCardData[] }) {
  return (
    <section id="auctions" className="scroll-mt-16 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground sm:text-3xl">
            Актуальные аукционы
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary" />
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            Автомобили, по которым прямо сейчас идут торги. Успейте сделать
            ставку до конца приёма заявок.
          </p>
        </div>

        {lots.length === 0 ? (
          <div className="mt-10 rounded-md border-2 border-dashed border-border bg-card p-12 text-center">
            <p className="text-lg font-bold">Активных торгов пока нет</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Загляните позже — новые лоты появляются регулярно.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {lots.map((lot) => (
                <LotCard key={lot.id} lot={lot} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/auctions"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Все аукционы
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
