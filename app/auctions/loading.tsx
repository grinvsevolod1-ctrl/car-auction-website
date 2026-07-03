import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-end justify-between border-t border-border pt-4">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export default function AuctionsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-9 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        <div className="mt-8 h-12 w-full animate-pulse rounded-xl bg-muted" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
