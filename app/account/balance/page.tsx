import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Wallet, Lock } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { getUserBalance } from '@/lib/queries'
import { getSettingNumber, getSetting } from '@/lib/settings'
import { formatMoney } from '@/lib/money'
import { formatDateTime } from '@/lib/format'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DepositForm } from '@/components/account/deposit-form'
import { DepositProofForm } from '@/components/account/deposit-proof-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Баланс и пополнение — IGNIS' }

const TX_LABEL: Record<string, string> = {
  DEPOSIT: 'Пополнение',
  HOLD: 'Заморозка под ставку',
  RELEASE: 'Разморозка средств',
  PURCHASE: 'Оплата лота',
  REFUND: 'Возврат',
  ADJUST: 'Корректировка',
}

const DEP_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидает оплаты/проверки', cls: 'bg-highlight/15 text-highlight' },
  CONFIRMED: { label: 'Зачислено', cls: 'bg-success/15 text-success' },
  REJECTED: { label: 'Отклонено', cls: 'bg-destructive/15 text-destructive' },
}

export default async function BalancePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account/balance')

  const [{ balance, transactions, deposits }, discountPct, operatorTelegram] =
    await Promise.all([
      getUserBalance(user.id),
      getSettingNumber('crypto_discount_pct'),
      getSetting('operator_telegram'),
    ])

  const availByn = balance.balanceByn - balance.heldByn
  const availUsd = balance.balanceUsd - balance.heldUsd

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          В личный кабинет
        </Link>

        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Баланс и пополнение
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Для участия в торгах на балансе должно быть достаточно средств — они
          замораживаются под вашу ставку и списываются только при победе.
        </p>

        {/* Балансы */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              cur: 'BYN' as const,
              title: 'Рублёвый баланс',
              total: balance.balanceByn,
              held: balance.heldByn,
              avail: availByn,
            },
            {
              cur: 'USD' as const,
              title: 'Криптобаланс',
              total: balance.balanceUsd,
              held: balance.heldUsd,
              avail: availUsd,
            },
          ].map((b) => (
            <div key={b.cur} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="size-4" />
                {b.title}
              </div>
              <p className="mt-2 font-display text-3xl font-bold">
                {formatMoney(b.avail, b.cur)}
              </p>
              <p className="text-xs text-muted-foreground">доступно</p>
              {b.held > 0 && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs">
                  <Lock className="size-3" />
                  Заморожено: {formatMoney(b.held, b.cur)}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <DepositForm discountPct={discountPct} operatorTelegram={operatorTelegram} />

          {/* Заявки на пополнение */}
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">
              Мои заявки
            </h2>
            {deposits.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Заявок пока нет.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {deposits.map((d) => {
                  const st = DEP_STATUS[d.status] ?? DEP_STATUS.PENDING
                  return (
                    <li key={d.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          {d.method === 'ERIP' ? 'ЕРИП' : `Крипта ${d.cryptoAsset ?? ''}`} ·{' '}
                          {formatMoney(d.amount, d.currency)}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Код: <span className="font-mono">{d.reference}</span> ·{' '}
                        {formatDateTime(d.createdAt)}
                      </p>
                      {d.method === 'CRYPTO' && d.wallet && (
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          Адрес {d.wallet.asset} ({d.wallet.network}):{' '}
                          <span className="font-mono">{d.wallet.address}</span>
                        </p>
                      )}
                      {d.status === 'PENDING' && (
                        <DepositProofForm id={d.id} defaultNote={d.userNote} />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* История операций */}
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            История операций
          </h2>
          {transactions.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Операций пока нет.
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Дата</th>
                    <th className="px-4 py-2.5">Операция</th>
                    <th className="px-4 py-2.5 text-right">Сумма</th>
                    <th className="px-4 py-2.5 text-right">Доступно после</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className={i % 2 ? 'bg-muted/30' : 'bg-card'}>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {formatDateTime(t.createdAt)}
                      </td>
                      <td className="px-4 py-2.5">
                        {TX_LABEL[t.type] ?? t.type}
                        {t.note ? (
                          <span className="text-muted-foreground"> · {t.note}</span>
                        ) : null}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-medium ${
                          t.amount < 0 ? 'text-destructive' : 'text-success'
                        }`}
                      >
                        {t.amount > 0 ? '+' : ''}
                        {formatMoney(t.amount, t.currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {formatMoney(t.balanceAfter, t.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
