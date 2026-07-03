import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function LotLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-muted" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
