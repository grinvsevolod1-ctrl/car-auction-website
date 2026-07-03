import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { consumeVerificationToken } from '@/lib/verification'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Подтверждение email — IGNIS' }

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const result = await consumeVerificationToken(token ?? '')

  const ok = result === 'ok'
  const message =
    result === 'ok'
      ? 'Email подтверждён. Теперь вы можете участвовать в торгах.'
      : result === 'expired'
        ? 'Срок действия ссылки истёк. Запросите новое письмо в личном кабинете.'
        : 'Ссылка недействительна. Возможно, email уже подтверждён.'

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          {ok ? (
            <CheckCircle2 className="mx-auto size-12 text-success" />
          ) : (
            <XCircle className="mx-auto size-12 text-destructive" />
          )}
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">
            {ok ? 'Готово' : 'Не получилось'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/account"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              В личный кабинет
            </Link>
            <Link
              href="/auctions"
              className="rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
            >
              К аукционам
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
