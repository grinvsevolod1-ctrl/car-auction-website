import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ShieldCheck, Gavel, Users, Car } from 'lucide-react'

export const metadata: Metadata = {
  title: 'О компании',
  description:
    'IGNIS — онлайн-аукцион автомобилей в Беларуси. Прозрачные торги и проверенные лоты.',
}

const values = [
  {
    icon: ShieldCheck,
    title: 'Проверенные лоты',
    text: 'Каждый автомобиль проходит осмотр и проверку истории перед выставлением на торги.',
  },
  {
    icon: Gavel,
    title: 'Честные торги',
    text: 'Ставки в реальном времени, антиснайпинг и понятные правила для всех участников.',
  },
  {
    icon: Users,
    title: 'Сообщество',
    text: 'Тысячи покупателей и продавцов доверяют площадке для сделок с автомобилями.',
  },
  {
    icon: Car,
    title: 'Широкий выбор',
    text: 'От городских авто до премиальных моделей — лоты на любой запрос и бюджет.',
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-balance">
              О компании IGNIS
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Мы создали прозрачную площадку для онлайн-торгов автомобилями в
              Беларуси. Наша цель — сделать покупку и продажу авто честной,
              быстрой и безопасной для каждого участника.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">{v.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {v.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              Как мы работаем
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Продавцы передают автомобили на площадку, мы проверяем документы и
              техническое состояние, публикуем лот с подробным описанием и фото.
              Участники делают ставки в реальном времени, а по завершении торгов
              победитель оформляет сделку. Мы сопровождаем процесс на каждом
              этапе.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
