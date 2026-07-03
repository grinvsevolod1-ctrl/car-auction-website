import { brands } from '@/lib/auctions'

export function BrandsMarquee() {
  const doubled = [...brands, ...brands]
  return (
    <section
      aria-label="Марки автомобилей на аукционе"
      className="border-b border-border py-6"
    >
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee flex w-max items-center gap-12 whitespace-nowrap group-hover:[animation-play-state:paused]">
          {doubled.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="font-display text-2xl font-semibold uppercase tracking-wide text-muted-foreground/60"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
