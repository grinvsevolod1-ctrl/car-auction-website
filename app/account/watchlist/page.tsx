import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Heart, ArrowRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { getUserWatchlist } from '@/lib/queries'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LotCard } from '@/components/lot-card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Избранное' }

export default async function WatchlistPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account/watchlist')

  const lots = await getUserWatchlist(user.id)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          В личный кабинет
        </Link>

        <h1 className="mt-4 flex items-center gap-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          <Heart className="size-7 text-primary" />
          Избранное
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Лоты, за которыми вы следите. Не пропустите завершение торгов.
        </p>

        {lots.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Heart className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-4 font-display text-xl font-bold">
              Список избранного пуст
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Добавляйте лоты в избранное кнопкой с сердечком на странице
              автомобиля, чтобы быстро к ним возвращаться.
            </p>
            <Link
              href="/auctions"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Смотреть аукционы
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
