import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const sessionResponseSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']),
})
