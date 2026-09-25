import { Hono } from 'hono'
import { adminUserRoutes } from './features/admin-users/routes'
import { authRoutes } from './features/auth/routes'
import { profileRoutes } from './features/profile/routes'

export const app = new Hono<{ Variables: { userId: string } }>()

app.route('/', authRoutes)
app.route('/', adminUserRoutes)
app.route('/', profileRoutes)
