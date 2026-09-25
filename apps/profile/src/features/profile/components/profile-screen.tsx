'use client'

import { ApiError } from '@platform/http'
import { Alert } from '@platform/ui/components/alert'
import { Button } from '@platform/ui/components/button'
import { Card } from '@platform/ui/components/card'
import { Skeleton } from '@platform/ui/components/skeleton'
import { useState } from 'react'
import { useProfile } from '../hooks/use-profile'
import { useUpdateProfile } from '../hooks/use-update-profile'
import type { UpdateProfile } from '../schema'
import { ProfileForm } from './profile-form'

export function ProfileScreen() {
  const query = useProfile()
  const update = useUpdateProfile()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (query.isLoading) return <Skeleton className="h-40" />

  if (query.error || !query.data) {
    return (
      <Alert>
        <p>{query.error instanceof ApiError ? query.error.message : 'Could not load profile'}</p>
        <Button className="mt-3" variant="secondary" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }

  async function onSubmit(values: UpdateProfile) {
    setError(null)
    setSaved(false)
    try {
      await update.mutateAsync(values)
      setSaved(true)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save')
    }
  }

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-semibold">Your profile</h1>
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      {saved ? <p className="mb-4 text-sm text-zinc-600">Profile saved.</p> : null}
      <ProfileForm
        defaultValues={{ displayName: query.data.displayName, email: query.data.email }}
        onSubmit={onSubmit}
        pending={update.isPending}
      />
    </Card>
  )
}
