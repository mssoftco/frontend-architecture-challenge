import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { Hono } from 'hono'
import { findUserById, findUserByEmail, type UserRecord } from '../../infrastructure/persistence/users'
import { jsonError } from '../../http/error'
import { loginSchema, sessionResponseSchema } from './schema'
import { SESSION_COOKIE_NAME, sessionCookieOptions, signSession, verifySession } from './session'

export const authRoutes = new Hono()

authRoutes.post('/auth/login', async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return jsonError(c, 400, 'VALIDATION_ERROR', 'Invalid login payload', parsed.error.issues)
  }

  const user = findUserByEmail(parsed.data.email)
  if (!user || user.password !== parsed.data.password) {
    return jsonError(c, 401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  }
  if (user.status === 'suspended') {
    return jsonError(c, 403, 'FORBIDDEN', 'Account is suspended')
  }

  const token = await signSession(user.id)
  setCookie(c, SESSION_COOKIE_NAME, token, sessionCookieOptions)
  return c.json({ ok: true })
})

authRoutes.post('/auth/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' })
  return c.json({ ok: true })
})

authRoutes.get('/auth/me', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return jsonError(c, 401, 'UNAUTHORIZED', 'Authentication required')
  return c.json(sessionResponseSchema.parse({ userId: user.id, role: user.role }))
})

export async function getCurrentUser(c: Parameters<typeof getCookie>[0]): Promise<UserRecord | null> {
  const token = getCookie(c, SESSION_COOKIE_NAME)
  if (!token) return null
  try {
    const claims = await verifySession(token)
    const user = findUserById(claims.userId)
    if (!user || user.status === 'suspended') return null
    return user
  } catch {
    return null
  }
}
