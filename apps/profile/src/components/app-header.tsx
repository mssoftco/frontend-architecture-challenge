'use client'

import { logout } from '@platform/auth/client'
import { Button } from '@platform/ui/components/button'
import { useRouter } from 'next/navigation'

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3000'

export function AppHeader() {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <p className="text-sm font-semibold">Profile</p>
      <div className="flex items-center gap-3">
        <a className="text-sm text-zinc-600 underline" href={adminUrl}>
          Admin app
        </a>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout()
            router.push('/login')
            router.refresh()
          }}
        >
          Log out
        </Button>
      </div>
    </header>
  )
}
