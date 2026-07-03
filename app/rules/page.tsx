import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Правила аукциона',
  description: 'Правила участия в онлайн-аукционе автомобилей IGNIS.',
}

const sections = [
  {
    title: '1. Участие в торгах',
    items: [
      'Для участия необходимо зарегистрироваться и подтвердить адрес электронной почты.',
      'Одна учётная запись — один участник. Передача доступа третьим лицам запрещена.',
      'Администрация вправе ограничить доступ при нарушении правил.',
    ],
  },
  {
    title: '2. Ставки',
    items: [
      'Ставка не может быть ниже суммы текущей цены и шага ставки.',
      'Сделанная ставка является обязательством и не может быть отозвана.',
      'Побеждает участник, предложивший наибольшую цену к моменту завершения торгов.',
    ],
  },
  {
    title: '3. Антиснайпинг',
    items: [
      'Если ставка сделана в последние минуты торгов, время завершения продлевается.',
      'Продление даёт другим участникам возможность ответить на ставку.',
    ],
  },
  {
    title: '4. Завершение и оплата',
    items: [
      'После завершения торгов победитель получает уведомление на email и в личном кабинете.',
      'Оформление сделки и оплата производятся в согласованные с площадкой сроки.',
      'При отказе победителя от сделки лот может быть предложен следующему участнику.',
    ],
  },
  {
    title: '5. Ответственность',
    items: [
      'Описание лота составляется на основе проверки, но не заменяет личный осмотр.',
      'Площадка выступает организатором торгов и содействует безопасному проведению сделки.',
    ],
  },
]

export default function RulesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
              Правила аукциона
            </h1>
            <p className="mt-4 text-muted-foreground">
              Ознакомьтесь с условиями участия перед тем, как делать ставки.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="font-display text-xl font-bold">{s.title}</h2>
                <ul className="mt-3 space-y-2">
                  {s.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
