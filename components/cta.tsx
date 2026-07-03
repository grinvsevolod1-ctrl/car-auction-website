import { Flame, ArrowRight } from 'lucide-react'

export function Cta() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-primary/30 bg-ember-glow bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Flame className="size-7" />
        </span>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-bold uppercase tracking-tight text-balance sm:text-5xl">
          Твоя следующая машина ждёт на торгах
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Регистрируйся бесплатно, получай доступ к закрытым лотам и делай первую
          ставку уже сегодня.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#auctions"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Начать бесплатно
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#footer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Связаться с нами
          </a>
        </div>
      </div>
    </section>
  )
}
