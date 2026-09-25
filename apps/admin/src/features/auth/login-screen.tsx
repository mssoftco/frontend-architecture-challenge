'use client'

import { login } from '@platform/auth/client'
import { ApiError } from '@platform/http'
import { Alert } from '@platform/ui/components/alert'
import { Card } from '@platform/ui/components/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from './login-form'
import type { LoginValues } from './schema'

export function LoginScreen() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: LoginValues) {
    setError(null)
    try {
      await login(values)
      router.push('/users')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not log in')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <Card className="w-full">
        <h1 className="mb-4 text-xl font-semibold">Admin login</h1>
        {error ? <Alert className="mb-4">{error}</Alert> : null}
        <LoginForm onSubmit={onSubmit} />
      </Card>
    </main>
  )
}
