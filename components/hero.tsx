import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { formatNumber } from '@/lib/format'

export function Hero({
  activeLots,
  totalLots,
  usersCount,
}: {
  activeLots: number
  totalLots: number
  usersCount: number
}) {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-sm bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            <span className="inline-block size-1.5 animate-pulse-dot rounded-full bg-primary" />
            Онлайн-аукцион автомобилей в Беларуси
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-balance sm:text-5xl">
            Покупайте авто на <span className="text-primary">честных торгах</span>
          </h1>

          <p className="mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            IGNIS — прозрачная электронная площадка с проверенными лотами и
            живыми ставками в реальном времени. Регистрируйтесь и участвуйте в
            торгах за лучшие автомобили страны.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auctions"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Смотреть аукционы
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-accent"
            >
              Регистрация
            </Link>
          </div>

          <dl className="mt-9 grid max-w-md grid-cols-3 gap-3">
            {[
              { label: 'Активных торгов', value: formatNumber(activeLots) },
              { label: 'Лотов всего', value: formatNumber(totalLots) },
              { label: 'Участников', value: formatNumber(usersCount) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-border bg-background p-3 text-center"
              >
                <dd className="font-display text-2xl font-bold text-primary">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[11px] text-muted-foreground">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-background shadow-md">
            <Image
              src="/cars/hero.png"
              alt="Автомобиль на аукционе IGNIS"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-3 -left-3 hidden items-center gap-3 rounded-md border border-border bg-card p-3 shadow-lg sm:flex">
            <span className="grid size-10 place-items-center rounded-md bg-accent text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Проверенные лоты</p>
              <p className="text-xs text-muted-foreground">Диагностика и история</p>
            </div>
          </div>
          <div className="absolute -right-3 top-6 hidden items-center gap-3 rounded-md border border-border bg-card p-3 shadow-lg sm:flex">
            <span className="grid size-10 place-items-center rounded-md bg-accent text-primary">
              <Zap className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Ставки в реальном времени</p>
              <p className="text-xs text-muted-foreground">Без задержек</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
