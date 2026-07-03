'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Copy, Check, ExternalLink, Landmark, Bitcoin } from 'lucide-react'
import {
  createDepositAction,
  type DepositState,
} from '@/lib/actions/deposits'
import { CRYPTO_ASSETS } from '@/lib/money'

const inputCls =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Создаём заявку…' : label}
    </button>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <code className="min-w-0 flex-1 truncate text-sm">{value}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Скопировать"
        >
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  )
}

function ResultPanel({ state }: { state: DepositState }) {
  if (!state.success) return null
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-success/30 bg-success/5 p-4">
      <p className="text-sm font-medium text-success">{state.success}</p>
      {state.reference && <CopyField label="Код заявки" value={state.reference} />}
      {state.redirectUrl && (
        <a
          href={state.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Перейти к оплате ЕРИП
          <ExternalLink className="size-4" />
        </a>
      )}
      {state.walletAddress && (
        <>
          <CopyField
            label={`Адрес кошелька ${state.cryptoAsset ?? ''} (${state.walletNetwork ?? ''})`}
            value={state.walletAddress}
          />
          {state.cryptoAmount && (
            <CopyField label="Сумма к переводу" value={state.cryptoAmount} />
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        После оплаты добавьте заявку и укажите хэш/комментарий в блоке «Мои
        заявки» ниже. Зачисление — после проверки оператором.
      </p>
    </div>
  )
}

export function DepositForm({
  discountPct,
  operatorTelegram,
}: {
  discountPct: number
  operatorTelegram: string
}) {
  const [method, setMethod] = useState<'ERIP' | 'CRYPTO'>('ERIP')
  const [asset, setAsset] = useState<string>('USDT')
  const [state, formAction] = useActionState<DepositState, FormData>(
    createDepositAction,
    {},
  )

  const current = CRYPTO_ASSETS.find((c) => c.asset === asset) ?? CRYPTO_ASSETS[0]

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">
        Пополнить баланс
      </h2>

      {/* Выбор метода */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod('ERIP')}
          className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
            method === 'ERIP'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted'
          }`}
        >
          <Landmark className="size-5 text-primary" />
          <span className="font-semibold">ЕРИП</span>
          <span className="text-xs text-muted-foreground">Рубли (Br)</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('CRYPTO')}
          className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
            method === 'CRYPTO'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted'
          }`}
        >
          <Bitcoin className="size-5 text-primary" />
          <span className="font-semibold">Криптовалюта</span>
          <span className="text-xs font-medium text-success">−{discountPct}% на сборы</span>
        </button>
      </div>

      {method === 'CRYPTO' && (
        <div className="mt-4 rounded-xl bg-success/5 p-3 text-sm text-success">
          При оплате криптой все процессуальные платежи и растаможка дешевле на{' '}
          <b>{discountPct}%</b>.
        </div>
      )}

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="method" value={method} />

        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium">
            Сумма пополнения {method === 'ERIP' ? '(Br)' : '(USDT)'}
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            step={1}
            required
            className={inputCls}
            placeholder={method === 'ERIP' ? '1000' : '500'}
          />
        </div>

        {method === 'CRYPTO' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="asset" className="mb-1.5 block text-sm font-medium">
                Монета
              </label>
              <select
                id="asset"
                name="asset"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className={inputCls}
              >
                {CRYPTO_ASSETS.map((c) => (
                  <option key={c.asset} value={c.asset}>
                    {c.asset} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="network" className="mb-1.5 block text-sm font-medium">
                Сеть
              </label>
              <select id="network" name="network" className={inputCls}>
                {current.networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {state.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmitButton label="Создать заявку на пополнение" />
      </form>

      <ResultPanel state={state} />

      <p className="mt-4 text-xs text-muted-foreground">
        Вопросы по оплате: Telegram{' '}
        <span className="font-medium text-foreground">{operatorTelegram}</span>
      </p>
    </div>
  )
}
