'use client'

import { ApiError } from '@platform/http'
import { Alert } from '@platform/ui/components/alert'
import { Button } from '@platform/ui/components/button'
import { Card } from '@platform/ui/components/card'
import { Skeleton } from '@platform/ui/components/skeleton'
import Link from 'next/link'
import { useUser } from '../hooks/use-user'

export function UserDetailsScreen({ id }: { id: string }) {
  const query = useUser(id)

  if (query.isLoading) return <Skeleton className="h-40" />

  if (query.error instanceof ApiError && query.error.code === 'USER_NOT_FOUND') {
    return <Card>User not found.</Card>
  }

  if (query.error || !query.data) {
    return (
      <Alert>
        <p>Could not load this user.</p>
        <Button className="mt-3" variant="secondary" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }

  const user = query.data
  return (
    <Card className="space-y-2">
      <h1 className="text-2xl font-semibold">{user.name}</h1>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <p>Status: {user.status}</p>
      <Link className="inline-block text-sm underline" href={`/users/${user.id}/edit`}>
        Edit
      </Link>
    </Card>
  )
}
