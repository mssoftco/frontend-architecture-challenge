'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@platform/ui/components/button'
import { Input } from '@platform/ui/components/input'
import { Label } from '@platform/ui/components/label'
import { useForm } from 'react-hook-form'
import { updateProfileSchema, type UpdateProfile } from '../schema'

export function ProfileForm({
  defaultValues,
  onSubmit,
  pending,
}: {
  defaultValues: UpdateProfile
  onSubmit: (values: UpdateProfile) => Promise<void>
  pending?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" {...register('displayName')} />
        {errors.displayName ? <p role="alert">Display name is required</p> : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email ? <p role="alert">Enter a valid email</p> : null}
      </div>
      <Button type="submit" disabled={pending}>
        Save
      </Button>
    </form>
  )
}
