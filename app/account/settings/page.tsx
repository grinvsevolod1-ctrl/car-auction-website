import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SettingsForm } from '@/components/account/settings-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Настройки профиля — IGNIS' }

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account/settings')

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-14">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          В личный кабинет
        </Link>

        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Настройки профиля
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Обновите личные данные и пароль для входа.
        </p>

        <div className="mt-8">
          <SettingsForm
            defaultName={user.name}
            defaultPhone={user.phone ?? ''}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
