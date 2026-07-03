import { getPaymentMethods } from '@/lib/admin-queries'
import { PaymentMethodsManager } from '@/components/admin/payment-methods-manager'

export const metadata = { title: 'Платёжные методы — Админка' }

export default async function AdminPaymentsPage() {
  const { links, wallets } = await getPaymentMethods()

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">Платёжные методы</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Настройте ссылки ЕРИП и криптокошельки для пополнения баланса.
        </p>
      </header>
      <PaymentMethodsManager links={links} wallets={wallets} />
    </div>
  )
}
