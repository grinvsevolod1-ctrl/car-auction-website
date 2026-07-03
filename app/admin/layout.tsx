import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { AdminNav } from '@/components/admin/admin-nav'
import { Logo } from '@/components/logo'
import { logoutAction } from '@/lib/actions/auth'
import { getPendingDepositCount, getPendingKycCount } from '@/lib/admin-queries'
import { LogOut } from 'lucide-react'

export const metadata = { title: 'Админка — IGNIS' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  const [deposits, kyc] = await Promise.all([
    getPendingDepositCount(),
    getPendingKycCount(),
  ])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:py-10">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-6">
            <Link href="/admin" className="mb-4 flex px-2">
              <Logo />
            </Link>
            <AdminNav />
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                Выйти
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
