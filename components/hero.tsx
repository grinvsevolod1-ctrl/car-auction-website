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
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="inline-block size-1.5 animate-pulse-dot rounded-full bg-primary" />
            Онлайн-аукцион автомобилей в Беларуси
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Покупайте авто на <span className="text-fire-gradient">честных торгах</span>
          </h1>

          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            IGNIS — прозрачный аукцион с проверенными лотами и живыми ставками в
            реальном времени. Регистрируйтесь и участвуйте в торгах за лучшие
            автомобили страны.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auctions"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Смотреть аукционы
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Регистрация
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { label: 'Активных торгов', value: formatNumber(activeLots) },
              { label: 'Лотов всего', value: formatNumber(totalLots) },
              { label: 'Участников', value: formatNumber(usersCount) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            <Image
              src="/cars/hero.png"
              alt="Премиальный автомобиль на аукционе IGNIS"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-lg sm:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Проверенные лоты</p>
              <p className="text-xs text-muted-foreground">Диагностика и история</p>
            </div>
          </div>
          <div className="absolute -right-4 top-6 hidden items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-lg sm:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
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
