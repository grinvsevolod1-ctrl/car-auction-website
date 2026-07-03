import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Clock, ShieldX } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { getUserKyc } from '@/lib/queries'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { KycForm } from '@/components/account/kyc-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Верификация личности — IGNIS' }

export default async function VerificationPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account/verification')

  const kyc = await getUserKyc(user.id)
  const status = kyc?.kycStatus ?? 'NONE'

  const birthStr = kyc?.birthDate
    ? new Date(kyc.birthDate).toISOString().slice(0, 10)
    : ''

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          В личный кабинет
        </Link>

        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Верификация личности
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Подтверждение личности (KYC) обязательно для участия в торгах —
          площадка работает только с совершеннолетними участниками.
        </p>

        {status === 'APPROVED' && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-5">
            <ShieldCheck className="size-8 text-success" />
            <div>
              <p className="font-semibold text-success">Личность подтверждена</p>
              <p className="text-sm text-muted-foreground">
                Вы можете участвовать в торгах.
              </p>
            </div>
          </div>
        )}

        {status === 'PENDING' && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-highlight/30 bg-highlight/5 p-5">
            <Clock className="size-8 text-highlight" />
            <div>
              <p className="font-semibold text-highlight">Анкета на проверке</p>
              <p className="text-sm text-muted-foreground">
                Обычно проверка занимает немного времени. Мы уведомим вас о
                результате.
              </p>
            </div>
          </div>
        )}

        {status === 'REJECTED' && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <ShieldX className="size-8 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Анкета отклонена</p>
              <p className="text-sm text-muted-foreground">
                {kyc?.kycRejectReason || 'Проверьте данные и отправьте анкету повторно.'}
              </p>
            </div>
          </div>
        )}

        {status !== 'APPROVED' && status !== 'PENDING' && (
          <div className="mt-8">
            <KycForm
              defaults={{
                firstName: kyc?.firstName,
                lastName: kyc?.lastName,
                middleName: kyc?.middleName,
                birthDate: birthStr,
                passportNumber: kyc?.passportNumber,
                country: kyc?.country,
                city: kyc?.city,
                address: kyc?.address,
                phone: kyc?.phone ?? user.phone,
                occupation: kyc?.occupation,
                sourceOfFunds: kyc?.sourceOfFunds,
              }}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
