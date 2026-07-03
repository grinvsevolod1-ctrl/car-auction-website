import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({
  page,
  pages,
  params,
}: {
  page: number
  pages: number
  params: Record<string, string | string[] | undefined>
}) {
  if (pages <= 1) return null

  function href(p: number) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (k === 'page') continue
      if (typeof v === 'string' && v) sp.set(k, v)
    }
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? `/auctions?${qs}` : '/auctions'
  }

  // Компактный набор номеров вокруг текущей страницы.
  const nums: number[] = []
  const from = Math.max(1, page - 2)
  const to = Math.min(pages, page + 2)
  for (let i = from; i <= to; i++) nums.push(i)

  const base =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors'

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Пагинация"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${base} hover:bg-muted`} aria-label="Предыдущая">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={`${base} cursor-not-allowed opacity-40`}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {from > 1 && (
        <>
          <Link href={href(1)} className={`${base} hover:bg-muted`}>
            1
          </Link>
          {from > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {nums.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? 'page' : undefined}
          className={
            n === page
              ? `${base} border-primary bg-primary text-primary-foreground`
              : `${base} hover:bg-muted`
          }
        >
          {n}
        </Link>
      ))}

      {to < pages && (
        <>
          {to < pages - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link href={href(pages)} className={`${base} hover:bg-muted`}>
            {pages}
          </Link>
        </>
      )}

      {page < pages ? (
        <Link href={href(page + 1)} className={`${base} hover:bg-muted`} aria-label="Следующая">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={`${base} cursor-not-allowed opacity-40`}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
