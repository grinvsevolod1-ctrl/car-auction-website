import { UserPlus, Search, Gavel, KeyRound } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Регистрация',
    text: 'Создайте аккаунт за минуту. Регистрация обязательна для участия в торгах.',
  },
  {
    icon: Search,
    title: 'Выбор лота',
    text: 'Изучайте фото, отчёт техэксперта, историю VIN и юридическую чистоту каждого автомобиля.',
  },
  {
    icon: Gavel,
    title: 'Торги',
    text: 'Делайте ставки онлайн в реальном времени. Текущая цена и история ставок видны всем участникам.',
  },
  {
    icon: KeyRound,
    title: 'Получение',
    text: 'Оформляем документы и доставляем авто в любой город Беларуси. Ключи — у вас в руках.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-primary">Процесс</span>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
            Четыре шага до новой машины
          </h2>
          <p className="mt-3 text-muted-foreground">
            Никаких серых схем и скрытых комиссий. Всё прозрачно от ставки до ключей.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="absolute right-5 top-5 font-display text-5xl font-bold text-primary/15">
                0{i + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-xl bg-primary/12 text-primary">
                <step.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
