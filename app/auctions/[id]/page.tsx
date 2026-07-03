import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LotGallery } from '@/components/lot-gallery'
import { LiveLotPanel } from '@/components/live-lot-panel'
import { getLotDetail, getLotUserState } from '@/lib/queries'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { REQUIRE_EMAIL_VERIFICATION } from '@/lib/config'
import { formatNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const lot = await getLotDetail(id)
  if (!lot) return { title: 'Лот не найден' }

  const desc =
    lot.description?.slice(0, 160) ||
    `${lot.make} ${lot.model}, ${lot.year} г. — текущая ставка ${formatNumber(
      lot.currentPrice,
    )} Br. Участвуйте в торгах на IGNIS.`
  const cover = lot.images[0] || '/og-image.png'

  return {
    title: lot.title,
    description: desc,
    openGraph: {
      type: 'website',
      title: lot.title,
      description: desc,
      images: [{ url: cover, alt: lot.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: lot.title,
      description: desc,
      images: [cover],
    },
  }
}

export default async function LotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [lot, session] = await Promise.all([getLotDetail(id), getSession()])

  if (!lot || lot.status === 'DRAFT') notFound()

  // Статус подтверждения email текущего пользователя (для гейта ставок).
  let isVerified = true
  if (session && REQUIRE_EMAIL_VERIFICATION) {
    const u = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { emailVerified: true },
    })
    isVerified = Boolean(u?.emailVerified)
  }

  // Избранное и автоставка текущего пользователя по этому лоту.
  const userState = session
    ? await getLotUserState(session.userId, lot.id)
    : { watching: false, autoBidMax: null }

  const specs: { label: string; value: string | number | null }[] = [
    { label: 'Марка', value: lot.make },
    { label: 'Модель', value: lot.model },
    { label: 'Год выпуска', value: lot.year },
    { label: 'Пробег', value: `${formatNumber(lot.mileage)} км` },
    { label: 'Двигатель', value: lot.engineVol ? `${lot.engineVol} л` : null },
    { label: 'Мощность', value: lot.power ? `${lot.power} л.с.` : null },
    { label: 'КПП', value: lot.transmission },
    { label: 'Кузов', value: lot.bodyType },
    { label: 'Топливо', value: lot.fuelType },
    { label: 'Привод', value: lot.drive },
    { label: 'Цвет', value: lot.color },
    { label: 'VIN', value: lot.vin },
    { label: 'Регион', value: lot.location },
    { label: 'Состояние', value: lot.condition },
  ].filter((s) => s.value !== null && s.value !== '')

  const initialLot = {
    id: lot.id,
    title: lot.title,
    status: lot.status,
    startPrice: lot.startPrice,
    currentPrice: lot.currentPrice,
    bidStep: lot.bidStep,
    buyNowPrice: lot.buyNowPrice,
    endsAt: lot.endsAt.toISOString(),
    bidCount: lot._count.bids,
    bids: lot.bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      name: b.user.name,
    })),
    winnerName: lot.winner?.name ?? null,
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            href="/auctions"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Ко всем аукционам
          </Link>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* Левая колонка */}
            <div>
              <LotGallery images={lot.images} title={lot.title} />

              <div className="mt-8">
                <h2 className="font-display text-2xl font-bold">Характеристики</h2>
                <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
                  {specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex justify-between gap-4 border-b border-border py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="text-right font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {lot.description && (
                <div className="mt-8">
                  <h2 className="font-display text-2xl font-bold">Описание</h2>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {lot.description}
                  </p>
                </div>
              )}
            </div>

            {/* Правая колонка — live-обновление */}
            <LiveLotPanel
              lot={initialLot}
              isAuthenticated={Boolean(session)}
              isVerified={isVerified}
              initialWatching={userState.watching}
              autoBidMax={userState.autoBidMax}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
