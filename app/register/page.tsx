import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { AuthForm } from '@/components/auth-form'

export const metadata = { title: 'Регистрация — IGNIS' }

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect('/account')

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-16">
      <AuthForm mode="register" />
    </main>
  )
}
