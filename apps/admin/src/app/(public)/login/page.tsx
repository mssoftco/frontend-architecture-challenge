import { getServerSession } from '@platform/auth/server'
import { redirect } from 'next/navigation'
import { LoginScreen } from '@/features/auth'

const profileUrl = process.env.NEXT_PUBLIC_PROFILE_URL ?? 'http://localhost:3001'

export default async function LoginPage() {
  const session = await getServerSession()
  if (session?.role === 'admin') redirect('/users')
  if (session) redirect(`${profileUrl}/profile`)
  return <LoginScreen />
}
