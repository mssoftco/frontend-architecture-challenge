import { Hono } from 'hono'
import { findUserById, updateUserRecord, type UserRecord } from '../../infrastructure/persistence/users'
import { jsonError } from '../../http/error'
import { getCurrentUser } from '../auth/routes'
import { profileResponseSchema, updateProfileSchema, type ProfileResponse } from './schema'

type ProfileEnv = { Variables: { userId: string } }

export const profileRoutes = new Hono<ProfileEnv>()

profileRoutes.use('/profile', async (c, next) => {
  const user = await getCurrentUser(c)
  if (!user) return jsonError(c, 401, 'UNAUTHORIZED', 'Authentication required')
  c.set('userId', user.id)
  await next()
})

profileRoutes.get('/profile', (c) => {
  const user = findUserById(c.get('userId'))
  if (!user) return jsonError(c, 401, 'UNAUTHORIZED', 'Authentication required')
  return c.json(toProfileResponse(user))
})

profileRoutes.patch('/profile', async (c) => {
  const parsed = updateProfileSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return jsonError(c, 400, 'VALIDATION_ERROR', 'Invalid profile payload', parsed.error.issues)
  }

  const updated = updateUserRecord(c.get('userId'), {
    name: parsed.data.displayName,
    email: parsed.data.email.toLowerCase(),
  })
  if (updated === 'email-taken') {
    return jsonError(c, 400, 'VALIDATION_ERROR', 'Email is already in use')
  }
  if (!updated) return jsonError(c, 401, 'UNAUTHORIZED', 'Authentication required')
  return c.json(toProfileResponse(updated))
})

function toProfileResponse(user: UserRecord): ProfileResponse {
  return profileResponseSchema.parse({
    id: user.id,
    displayName: user.name,
    email: user.email,
  })
}
