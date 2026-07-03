import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AuctionFilters } from '@/components/auction-filters'
import { LotCard } from '@/components/lot-card'
import { Pagination } from '@/components/pagination'
import { getPublicLots, type LotFilter } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Аукционы',
  description: 'Каталог автомобилей на онлайн-аукционе IGNIS.',
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const filter: LotFilter = {
    q: typeof sp.q === 'string' ? sp.q : undefined,
    status: (typeof sp.status === 'string' ? sp.status : 'ACTIVE') as LotFilter['status'],
    sort: (typeof sp.sort === 'string' ? sp.sort : 'ending') as LotFilter['sort'],
    page: typeof sp.page === 'string' ? Number(sp.page) : 1,
  }

  const { lots, total, page, pages } = await getPublicLots(filter)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              Каталог аукционов
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Выберите автомобиль и сделайте ставку. Участие в торгах доступно
              после регистрации.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <Suspense fallback={<div className="h-32" />}>
            <AuctionFilters />
          </Suspense>

          {lots.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-display text-xl font-bold">Ничего не найдено</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Попробуйте изменить фильтры или зайти позже.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-6 text-sm text-muted-foreground">
                Найдено лотов: {total}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {lots.map((lot) => (
                  <LotCard key={lot.id} lot={lot} />
                ))}
              </div>
              <Pagination page={page} pages={pages} params={sp} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
