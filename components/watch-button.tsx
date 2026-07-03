'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toggleWatchAction, type WatchState } from '@/lib/actions/watchlist'

export function WatchButton({
  lotId,
  initialWatching,
  isAuthenticated,
}: {
  lotId: string
  initialWatching: boolean
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [watching, setWatching] = useState(initialWatching)
  const [state, formAction, pending] = useActionState<WatchState, FormData>(
    toggleWatchAction,
    {},
  )

  useEffect(() => {
    if (typeof state.watching === 'boolean') setWatching(state.watching)
  }, [state.watching])

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/login?next=/auctions/${lotId}`)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <Heart className="size-4" />
        В избранное
      </button>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="lotId" value={lotId} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={watching}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
          watching
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-card hover:bg-muted'
        }`}
      >
        <Heart className={`size-4 ${watching ? 'fill-current' : ''}`} />
        {watching ? 'В избранном' : 'В избранное'}
      </button>
      {state.error && (
        <p className="mt-2 text-xs text-destructive">{state.error}</p>
      )}
    </form>
  )
}
