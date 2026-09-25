import 'server-only'

import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, sessionSchema, type Session } from './types'

const apiUrl = process.env.API_URL ?? 'http://localhost:4000'

export async function getServerSession(): Promise<Session | null> {
  const jar = await cookies()
  const sessionCookie = jar.get(SESSION_COOKIE_NAME)
  if (!sessionCookie) return null

  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) return null

  const payload: unknown = await response.json()
  const parsed = sessionSchema.safeParse(payload)
  return parsed.success ? parsed.data : null
}
