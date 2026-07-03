import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { BrandsMarquee } from '@/components/brands-marquee'
import { LiveAuctions } from '@/components/live-auctions'
import { HowItWorks } from '@/components/how-it-works'
import { WhyUs } from '@/components/why-us'
import { Cta } from '@/components/cta'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <BrandsMarquee />
        <LiveAuctions />
        <HowItWorks />
        <WhyUs />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  )
}
