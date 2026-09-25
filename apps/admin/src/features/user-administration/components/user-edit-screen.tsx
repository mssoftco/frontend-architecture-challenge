'use client'

import { ApiError } from '@platform/http'
import { Alert } from '@platform/ui/components/alert'
import { Card } from '@platform/ui/components/card'
import { Skeleton } from '@platform/ui/components/skeleton'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUpdateUser } from '../hooks/use-update-user'
import { useUser } from '../hooks/use-user'
import type { UpdateManagedUser } from '../schema'
import { UserForm } from './user-form'

export function UserEditScreen({ id }: { id: string }) {
  const router = useRouter()
  const query = useUser(id)
  const update = useUpdateUser(id)
  const [error, setError] = useState<string | null>(null)

  if (query.isLoading) return <Skeleton className="h-40" />
  if (query.error instanceof ApiError && query.error.code === 'USER_NOT_FOUND') {
    return <Card>User not found.</Card>
  }
  if (!query.data) return <Alert>Could not load this user.</Alert>

  async function onSubmit(values: UpdateManagedUser) {
    setError(null)
    try {
      await update.mutateAsync(values)
      router.push(`/users/${id}`)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save')
    }
  }

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Edit user</h1>
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      <UserForm defaultValues={query.data} onSubmit={onSubmit} pending={update.isPending} />
    </Card>
  )
}
