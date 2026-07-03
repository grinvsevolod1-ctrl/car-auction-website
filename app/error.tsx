'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] app error boundary:', error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </span>

        <h1 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight">
          Что-то пошло не так
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Произошла ошибка при загрузке страницы. Попробуйте обновить — если
          проблема повторяется, зайдите чуть позже.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="size-4" />
            Попробовать снова
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Home className="size-4" />
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
