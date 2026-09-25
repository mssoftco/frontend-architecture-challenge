import { z } from 'zod'

export const userRoleSchema = z.enum(['admin', 'member'])
export const accountStatusSchema = z.enum(['active', 'suspended'])

export const adminUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: userRoleSchema,
  status: accountStatusSchema,
})

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  q: z.string().trim().optional(),
  role: userRoleSchema.optional(),
  status: accountStatusSchema.optional(),
})

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  role: userRoleSchema,
  status: accountStatusSchema,
})

export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>
