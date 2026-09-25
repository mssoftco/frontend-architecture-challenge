import { getServerSession } from '@platform/auth/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { Forbidden } from '@/components/forbidden'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') return <Forbidden />

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </>
  )
}
