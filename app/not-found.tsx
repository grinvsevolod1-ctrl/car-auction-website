import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Logo } from '@/components/logo'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <p className="mt-10 font-display text-7xl font-bold text-primary sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">
          Страница не найдена
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Возможно, лот уже продан или ссылка устарела. Вернитесь на главную или
          посмотрите активные аукционы.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="size-4" />
            На главную
          </Link>
          <Link
            href="/auctions"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Search className="size-4" />
            Все аукционы
          </Link>
        </div>
      </div>
    </main>
  )
}
