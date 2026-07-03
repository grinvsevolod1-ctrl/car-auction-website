import Image from 'next/image'
import { Flame, ShieldCheck, Gavel, ArrowRight } from 'lucide-react'
import { stats } from '@/lib/auctions'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ember-glow pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Flame className="size-3.5" />
            Автоаукцион №1 в Беларуси
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Торгуйся за <span className="text-fire-gradient">мечту</span>
            <br />
            на колёсах
          </h1>

          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            IGNIS — живые онлайн-торги проверенных автомобилей. Прозрачные ставки,
            честная история каждого лота и доставка под ключ по всей Беларуси.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#auctions"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <Gavel className="size-5" />
              Участвовать в торгах
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Как это работает
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 text-primary" />
            Проверка юриста и техэксперта по каждому лоту
          </div>
        </div>

        {/* Hero image card */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              LIVE · 214 участников
            </div>

            <Image
              src="/cars/hero.png"
              alt="Премиальный спорткар на аукционе IGNIS"
              width={900}
              height={640}
              priority
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-background via-background/70 to-transparent p-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Лот вечера
                </p>
                <p className="font-display text-xl font-bold">
                  Aurora GT · 2024
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Ставка
                </p>
                <p className="font-mono text-xl font-bold text-primary">
                  342 000 Br
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-6 text-center sm:py-8">
              <p className="font-display text-3xl font-bold text-fire-gradient sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
