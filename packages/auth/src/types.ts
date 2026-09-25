import { z } from 'zod'

export const SESSION_COOKIE_NAME = 'platform_session'

export const sessionSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']),
})

export type Session = z.infer<typeof sessionSchema>

export type LoginInput = {
  email: string
  password: string
}
