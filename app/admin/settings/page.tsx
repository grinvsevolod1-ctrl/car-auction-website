import { getAllSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/settings-form'

export const metadata = { title: 'Настройки портала — Админка' }

export default async function AdminSettingsPage() {
  const values = await getAllSettings()

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Настройки портала</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Курсы, ставки растаможки, скидка за крипту и инструкции по оплате.
        </p>
      </header>
      <SettingsForm values={values} />
    </div>
  )
}
