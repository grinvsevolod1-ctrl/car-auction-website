import { Flame, Phone, Mail, MapPin, Camera, Send } from 'lucide-react'

const columns = [
  {
    title: 'Аукцион',
    links: ['Живые торги', 'Как это работает', 'Календарь торгов', 'Автоставка'],
  },
  {
    title: 'Компания',
    links: ['О нас', 'Гарантии', 'Отзывы', 'Вакансии'],
  },
  {
    title: 'Помощь',
    links: ['Частые вопросы', 'Доставка', 'Оплата', 'Договор оферты'],
  },
]

export function SiteFooter() {
  return (
    <footer id="footer" className="scroll-mt-24 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Flame className="size-5" />
              </span>
              <span className="font-display text-xl font-bold uppercase tracking-widest">
                Ignis
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Премиальный онлайн-аукцион автомобилей в Беларуси. Честные торги,
              проверенные лоты, доставка под ключ.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Camera className="size-5" />
              </a>
              <a
                href="#"
                aria-label="Telegram"
                className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Send className="size-5" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
          <a
            href="tel:+375291234567"
            className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="size-4 text-primary" />
            +375 29 123-45-67
          </a>
          <a
            href="mailto:hello@ignis.by"
            className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-4 text-primary" />
            hello@ignis.by
          </a>
          <span className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            Минск, ул. Автомобильная, 7
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} IGNIS. Все права защищены.</p>
          <p>УНП 000000000 · ООО «Игнис Авто»</p>
        </div>
      </div>
    </footer>
  )
}
