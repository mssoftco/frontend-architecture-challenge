'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@platform/ui/components/button'
import { Input } from '@platform/ui/components/input'
import { Label } from '@platform/ui/components/label'
import { Select } from '@platform/ui/components/select'
import { useForm } from 'react-hook-form'
import { updateManagedUserSchema, type UpdateManagedUser } from '../schema'

export function UserForm({
  defaultValues,
  onSubmit,
  pending,
}: {
  defaultValues: UpdateManagedUser
  onSubmit: (values: UpdateManagedUser) => Promise<void>
  pending?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateManagedUser>({
    resolver: zodResolver(updateManagedUserSchema),
    defaultValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name ? <p role="alert">Name is required</p> : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email ? <p role="alert">Enter a valid email</p> : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="role">Role</Label>
        <Select id="role" {...register('role')}>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <Select id="status" {...register('status')}>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        Save
      </Button>
    </form>
  )
}
