import { z } from 'zod'

export const profileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.email(),
})

export type Profile = z.infer<typeof profileSchema>

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1),
  email: z.email(),
})

export type UpdateProfile = z.infer<typeof updateProfileSchema>
