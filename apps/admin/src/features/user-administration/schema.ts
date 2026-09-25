import { z } from 'zod'

export const managedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'suspended']),
})

export type ManagedUser = z.infer<typeof managedUserSchema>

export const managedUserListSchema = z.object({
  items: z.array(managedUserSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
})

export const updateManagedUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'suspended']),
})

export type UpdateManagedUser = z.infer<typeof updateManagedUserSchema>
