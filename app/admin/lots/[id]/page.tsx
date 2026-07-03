import { notFound } from 'next/navigation'
import { updateLotAction, type LotFormState } from '@/lib/actions/lots'
import { getAdminLot } from '@/lib/admin-queries'
import { LotForm } from '@/components/admin/lot-form'

export const metadata = { title: 'Редактирование лота — Админка' }

export default async function EditLotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lot = await getAdminLot(id)
  if (!lot) notFound()

  const action = async (state: LotFormState, formData: FormData) => {
    'use server'
    return updateLotAction(id, state, formData)
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
        Редактирование лота
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{lot.title}</p>
      <LotForm action={action} lot={lot} submitLabel="Сохранить изменения" />
    </div>
  )
}
