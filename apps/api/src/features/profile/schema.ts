import { z } from 'zod'

export const profileResponseSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.email(),
})

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1),
    email: z.email(),
  })
  .strict()

export type ProfileResponse = z.infer<typeof profileResponseSchema>
