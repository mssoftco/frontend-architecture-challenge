import { getServerSession } from '@platform/auth/server'
import { redirect } from 'next/navigation'
import { LoginScreen } from '@/features/auth'

export default async function LoginPage() {
  const session = await getServerSession()
  if (session) redirect('/profile')
  return <LoginScreen />
}
