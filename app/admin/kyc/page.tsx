import { getKycProfiles } from '@/lib/admin-queries'
import { formatDateTime } from '@/lib/format'
import { approveKycAction, rejectKycAction } from '@/lib/actions/admin-payments'
import { Check, X, ShieldCheck } from 'lucide-react'

export const metadata = { title: 'Верификация (KYC) — Админка' }

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'На проверке', cls: 'bg-highlight/15 text-highlight' },
  APPROVED: { label: 'Подтверждена', cls: 'bg-success/15 text-success' },
  REJECTED: { label: 'Отклонена', cls: 'bg-destructive/15 text-destructive' },
}

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('ru-RU').format(d)
}

export default async function AdminKycPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter =
    status === 'APPROVED' || status === 'REJECTED' || status === 'PENDING'
      ? status
      : undefined
  const profiles = await getKycProfiles(filter)

  const tabs = [
    { key: 'PENDING', label: 'На проверке' },
    { key: 'APPROVED', label: 'Подтверждённые' },
    { key: 'REJECTED', label: 'Отклонённые' },
    { key: '', label: 'Все' },
  ]

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Верификация личности</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Проверьте анкеты KYC и подтверждение возраста участников (18+).
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (filter ?? '') === t.key
          return (
            <a
              key={t.key}
              href={t.key ? `/admin/kyc?status=${t.key}` : '/admin/kyc'}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </a>
          )
        })}
      </div>

      <div className="space-y-3">
        {profiles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Анкет нет
          </div>
        )}
        {profiles.map((p) => {
          const badge = STATUS_LABEL[p.kycStatus] ?? STATUS_LABEL.PENDING
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {p.lastName} {p.firstName} {p.middleName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.name} · {p.email}
                    </p>
                  </div>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <dt className="text-muted-foreground">Дата рождения</dt>
                  <dd className="font-medium">{fmtDate(p.birthDate)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <dt className="text-muted-foreground">Паспорт</dt>
                  <dd className="font-medium">{p.passportNumber ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <dt className="text-muted-foreground">Страна / город</dt>
                  <dd className="font-medium">
                    {p.country ?? '—'}
                    {p.city ? `, ${p.city}` : ''}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <dt className="text-muted-foreground">Телефон</dt>
                  <dd className="font-medium">{p.phone ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <dt className="text-muted-foreground">Занятость</dt>
                  <dd className="font-medium">{p.occupation ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/60 py-1">
                  <dt className="text-muted-foreground">Источник средств</dt>
                  <dd className="font-medium">{p.sourceOfFunds ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/60 py-1 sm:col-span-2">
                  <dt className="text-muted-foreground">Адрес</dt>
                  <dd className="font-medium">{p.address ?? '—'}</dd>
                </div>
              </dl>

              <p className="mt-2 text-xs text-muted-foreground">
                Подана: {p.kycSubmittedAt ? formatDateTime(p.kycSubmittedAt) : '—'}
              </p>

              {p.kycRejectReason && (
                <p className="mt-1 text-sm text-destructive">
                  Причина отказа: {p.kycRejectReason}
                </p>
              )}

              {p.kycStatus === 'PENDING' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approveKycAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-success-foreground"
                    >
                      <Check className="size-4" />
                      Подтвердить
                    </button>
                  </form>
                  <form action={rejectKycAction} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      name="reason"
                      placeholder="Причина отказа"
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                      Отклонить
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
