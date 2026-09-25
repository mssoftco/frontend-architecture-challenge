import { getServerSession } from '@platform/auth/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-xl p-6">{children}</main>
    </>
  )
}
