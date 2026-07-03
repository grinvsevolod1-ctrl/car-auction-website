import { ShieldCheck, FileSearch, Truck, Wallet, Headphones, BadgeCheck } from 'lucide-react'

const features = [
  {
    icon: FileSearch,
    title: 'Проверка 200+ пунктов',
    text: 'Каждый лот проходит диагностику на сертифицированном СТО. Отчёт с фото — в карточке авто.',
  },
  {
    icon: ShieldCheck,
    title: 'Юридическая чистота',
    text: 'Проверяем залоги, аресты, ДТП и реальный пробег. Гарантия возврата, если что-то скрыто.',
  },
  {
    icon: Wallet,
    title: 'Честные ставки',
    text: 'Никаких фейковых ставок и подставных участников. История торгов открыта для всех.',
  },
  {
    icon: Truck,
    title: 'Доставка по РБ',
    text: 'Привезём авто в Минск, Брест, Гомель, Гродно, Витебск или Могилёв в течение 4 дней.',
  },
  {
    icon: BadgeCheck,
    title: 'Страхование сделки',
    text: 'Деньги переводятся продавцу только после того, как вы получили автомобиль и документы.',
  },
  {
    icon: Headphones,
    title: 'Поддержка 24/7',
    text: 'Персональный менеджер сопровождает вас от первой ставки до постановки на учёт.',
  },
]

export function WhyUs() {
  return (
    <section id="why" className="scroll-mt-24 border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-primary">Почему IGNIS</span>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl text-balance">
            Аукцион, которому доверяют
          </h2>
          <p className="mt-3 text-muted-foreground">
            Мы убрали всё, за что не любят автоаукционы. Осталась только выгода и
            уверенность в покупке.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
