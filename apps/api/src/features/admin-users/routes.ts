import { Hono } from 'hono'
import {
  findUserById,
  listUserRecords,
  updateUserRecord,
  type UserRecord,
} from '../../infrastructure/persistence/users'
import { jsonError } from '../../http/error'
import { getCurrentUser } from '../auth/routes'
import {
  adminUserListQuerySchema,
  adminUserResponseSchema,
  updateAdminUserSchema,
  type AdminUserResponse,
} from './schema'

const PAGE_SIZE = 10

export const adminUserRoutes = new Hono()

async function requireAdmin(
  c: Parameters<Parameters<typeof adminUserRoutes.use>[1]>[0],
  next: () => Promise<void>,
) {
  const user = await getCurrentUser(c)
  if (!user) return jsonError(c, 401, 'UNAUTHORIZED', 'Authentication required')
  if (user.role !== 'admin') return jsonError(c, 403, 'FORBIDDEN', 'Admin role required')
  return next()
}

adminUserRoutes.use('/admin/users', requireAdmin)
adminUserRoutes.use('/admin/users/:id', requireAdmin)

adminUserRoutes.get('/admin/users', (c) => {
  const raw = {
    page: emptyToUndefined(c.req.query('page')),
    q: emptyToUndefined(c.req.query('q')),
    role: emptyToUndefined(c.req.query('role')),
    status: emptyToUndefined(c.req.query('status')),
  }
  const parsed = adminUserListQuerySchema.safeParse(raw)
  if (!parsed.success) {
    return jsonError(c, 400, 'VALIDATION_ERROR', 'Invalid query', parsed.error.issues)
  }

  const query = parsed.data.q?.toLowerCase()
  const filtered = listUserRecords().filter((user) => {
    const matchesQuery =
      !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    const matchesRole = !parsed.data.role || user.role === parsed.data.role
    const matchesStatus = !parsed.data.status || user.status === parsed.data.status
    return matchesQuery && matchesRole && matchesStatus
  })

  const start = (parsed.data.page - 1) * PAGE_SIZE
  const items = filtered.slice(start, start + PAGE_SIZE).map(toAdminUserResponse)
  return c.json({
    items,
    page: parsed.data.page,
    pageSize: PAGE_SIZE,
    total: filtered.length,
  })
})

adminUserRoutes.get('/admin/users/:id', (c) => {
  const user = findUserById(c.req.param('id'))
  if (!user) return jsonError(c, 404, 'USER_NOT_FOUND', 'User not found')
  return c.json(toAdminUserResponse(user))
})

adminUserRoutes.patch('/admin/users/:id', async (c) => {
  const parsed = updateAdminUserSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return jsonError(c, 400, 'VALIDATION_ERROR', 'Invalid user payload', parsed.error.issues)
  }

  const updated = updateUserRecord(c.req.param('id'), {
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
  })
  if (updated === 'email-taken') {
    return jsonError(c, 400, 'VALIDATION_ERROR', 'Email is already in use')
  }
  if (!updated) return jsonError(c, 404, 'USER_NOT_FOUND', 'User not found')
  return c.json(toAdminUserResponse(updated))
})

function toAdminUserResponse(user: UserRecord): AdminUserResponse {
  return adminUserResponseSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  })
}

function emptyToUndefined(value: string | undefined) {
  if (value === undefined || value.trim() === '') return undefined
  return value
}
