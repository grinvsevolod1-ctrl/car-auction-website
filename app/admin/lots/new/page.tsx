import { createLotAction } from '@/lib/actions/lots'
import { LotForm } from '@/components/admin/lot-form'

export const metadata = { title: 'Новый лот — Админка' }

export default function NewLotPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
        Новый лот
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Заполните карточку автомобиля. Статус «Идут торги» сделает лот видимым на
        сайте.
      </p>
      <LotForm action={createLotAction} submitLabel="Создать лот" />
    </div>
  )
}
