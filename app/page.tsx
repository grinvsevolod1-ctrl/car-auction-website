import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/hero'
import { BrandsMarquee } from '@/components/brands-marquee'
import { FeaturedLots } from '@/components/featured-lots'
import { HowItWorks } from '@/components/how-it-works'
import { WhyUs } from '@/components/why-us'
import { Cta } from '@/components/cta'
import { getFeaturedLots, getPublicStats } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [lots, stats] = await Promise.all([
    getFeaturedLots(6),
    getPublicStats(),
  ])

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero
          activeLots={stats.activeLots}
          totalLots={stats.totalLots}
          usersCount={stats.usersCount}
        />
        <BrandsMarquee />
        <FeaturedLots lots={lots} />
        <HowItWorks />
        <WhyUs />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  )
}
