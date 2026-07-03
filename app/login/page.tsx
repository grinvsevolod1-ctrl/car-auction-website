import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { AuthForm } from '@/components/auth-form'

export const metadata = { title: 'Вход — IGNIS' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const session = await getSession()
  if (session) redirect('/account')
  const { next } = await searchParams

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-16">
      <AuthForm mode="login" next={next} />
    </main>
  )
}
