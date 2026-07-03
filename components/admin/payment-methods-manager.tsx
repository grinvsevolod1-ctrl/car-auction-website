'use client'

import { useActionState } from 'react'
import {
  createPaymentLinkAction,
  togglePaymentLinkAction,
  deletePaymentLinkAction,
  createWalletAction,
  toggleWalletAction,
  deleteWalletAction,
  type SimpleFormState,
} from '@/lib/actions/admin-payments'
import { CRYPTO_ASSETS } from '@/lib/money'
import { Link2, Wallet, Plus, Power, Trash2 } from 'lucide-react'

type PaymentLink = {
  id: string
  label: string
  url: string
  active: boolean
  sortOrder: number
}
type CryptoWallet = {
  id: string
  asset: string
  network: string
  address: string
  note: string | null
  active: boolean
  sortOrder: number
}

const initial: SimpleFormState = {}

export function PaymentMethodsManager({
  links,
  wallets,
}: {
  links: PaymentLink[]
  wallets: CryptoWallet[]
}) {
  const [linkState, linkAction, linkPending] = useActionState(
    createPaymentLinkAction,
    initial,
  )
  const [walletState, walletAction, walletPending] = useActionState(
    createWalletAction,
    initial,
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ЕРИП-ссылки */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Link2 className="size-5 text-primary" />
          Ссылки ЕРИП
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Пользователи перенаправляются по ссылкам по очереди (round-robin).
        </p>

        <ul className="mt-4 space-y-2">
          {links.length === 0 && (
            <li className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Ссылок пока нет
            </li>
          )}
          {links.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${l.active ? 'bg-success' : 'bg-muted-foreground/40'}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.label}</p>
                <p className="truncate text-xs text-muted-foreground">{l.url}</p>
              </div>
              <form action={togglePaymentLinkAction}>
                <input type="hidden" name="id" value={l.id} />
                <button
                  type="submit"
                  title={l.active ? 'Отключить' : 'Включить'}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Power className="size-4" />
                </button>
              </form>
              <form action={deletePaymentLinkAction}>
                <input type="hidden" name="id" value={l.id} />
                <button
                  type="submit"
                  title="Удалить"
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={linkAction} className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="label"
              placeholder="Название (напр. ЕРИП Банк 1)"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              name="sortOrder"
              type="number"
              defaultValue={links.length}
              placeholder="Порядок"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <input
            name="url"
            type="url"
            placeholder="https://..."
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          {linkState.error && (
            <p className="text-sm text-destructive">{linkState.error}</p>
          )}
          {linkState.success && (
            <p className="text-sm text-success">{linkState.success}</p>
          )}
          <button
            type="submit"
            disabled={linkPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Plus className="size-4" />
            Добавить ссылку
          </button>
        </form>
      </section>

      {/* Криптокошельки */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Wallet className="size-5 text-primary" />
          Криптокошельки
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Адреса для приёма пополнений в криптовалюте.
        </p>

        <ul className="mt-4 space-y-2">
          {wallets.length === 0 && (
            <li className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Кошельков пока нет
            </li>
          )}
          {wallets.map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${w.active ? 'bg-success' : 'bg-muted-foreground/40'}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {w.asset}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {w.network}
                  </span>
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {w.address}
                </p>
              </div>
              <form action={toggleWalletAction}>
                <input type="hidden" name="id" value={w.id} />
                <button
                  type="submit"
                  title={w.active ? 'Отключить' : 'Включить'}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Power className="size-4" />
                </button>
              </form>
              <form action={deleteWalletAction}>
                <input type="hidden" name="id" value={w.id} />
                <button
                  type="submit"
                  title="Удалить"
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={walletAction} className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="asset"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CRYPTO_ASSETS.map((c) => (
                <option key={c.asset} value={c.asset}>
                  {c.asset} — {c.name}
                </option>
              ))}
            </select>
            <input
              name="network"
              placeholder="Сеть (напр. TRC20)"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <input
            name="address"
            placeholder="Адрес кошелька"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="note"
              placeholder="Заметка (необязательно)"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              name="sortOrder"
              type="number"
              defaultValue={wallets.length}
              placeholder="Порядок"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {walletState.error && (
            <p className="text-sm text-destructive">{walletState.error}</p>
          )}
          {walletState.success && (
            <p className="text-sm text-success">{walletState.success}</p>
          )}
          <button
            type="submit"
            disabled={walletPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Plus className="size-4" />
            Добавить кошелёк
          </button>
        </form>
      </section>
    </div>
  )
}
