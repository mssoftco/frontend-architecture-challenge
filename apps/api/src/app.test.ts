import { beforeEach, describe, expect, it } from 'vitest'
import { app } from './app'
import { signSession } from './features/auth/session'
import { resetUsers, updateUserRecord } from './infrastructure/persistence/users'

beforeEach(() => {
  resetUsers()
})

async function login(email: string, password: string) {
  return app.request('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

function cookieFrom(response: Response) {
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) throw new Error('missing set-cookie')
  return setCookie.split(';')[0] ?? setCookie
}

describe('auth', () => {
  it('signs in an admin and returns a session', async () => {
    const response = await login('admin@example.com', 'admin12345')
    expect(response.status).toBe(200)
    const cookie = cookieFrom(response)

    const me = await app.request('/auth/me', { headers: { cookie } })
    expect(me.status).toBe(200)
    await expect(me.json()).resolves.toEqual({ userId: 'user_admin', role: 'admin' })
  })

  it('rejects invalid credentials', async () => {
    const response = await login('admin@example.com', 'wrong-password')
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })

  it('rejects a missing session', async () => {
    const response = await app.request('/auth/me')
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('rejects an expired token', async () => {
    const token = await signSession('user_admin', '-1s')
    const response = await app.request('/auth/me', {
      headers: { cookie: `platform_session=${token}` },
    })
    expect(response.status).toBe(401)
  })

  it('rejects a tampered token', async () => {
    const response = await app.request('/auth/me', {
      headers: { cookie: 'platform_session=not-a-jwt' },
    })
    expect(response.status).toBe(401)
  })
})

describe('authorization', () => {
  it('lets an admin list users and blocks a member', async () => {
    const adminCookie = cookieFrom(await login('admin@example.com', 'admin12345'))
    const memberCookie = cookieFrom(await login('member@example.com', 'member12345'))

    const allowed = await app.request('/admin/users', { headers: { cookie: adminCookie } })
    expect(allowed.status).toBe(200)
    const body = (await allowed.json()) as { items: Array<{ role: string; status: string }> }
    expect(body.items.length).toBeGreaterThan(0)
    expect(body.items[0]).not.toHaveProperty('password')

    const denied = await app.request('/admin/users', { headers: { cookie: memberCookie } })
    expect(denied.status).toBe(403)
    await expect(denied.json()).resolves.toMatchObject({ code: 'FORBIDDEN' })
  })


  it('rejects admin access after the stored role changes', async () => {
    const cookie = cookieFrom(await login('admin@example.com', 'admin12345'))
    updateUserRecord('user_admin', { role: 'member' })

    const response = await app.request('/admin/users', { headers: { cookie } })
    expect(response.status).toBe(403)
  })

  it('rejects admin access after the account is suspended', async () => {
    const cookie = cookieFrom(await login('admin@example.com', 'admin12345'))
    updateUserRecord('user_admin', { status: 'suspended' })

    const response = await app.request('/admin/users', { headers: { cookie } })
    expect(response.status).toBe(401)
  })

  it('rejects a suspended session on the profile route', async () => {
    const cookie = cookieFrom(await login('member@example.com', 'member12345'))
    updateUserRecord('user_member', { status: 'suspended' })

    const response = await app.request('/profile', { headers: { cookie } })
    expect(response.status).toBe(401)
  })
  it('returns the member profile without admin fields', async () => {
    const cookie = cookieFrom(await login('member@example.com', 'member12345'))
    const response = await app.request('/profile', { headers: { cookie } })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      id: 'user_member',
      displayName: 'Member User',
      email: 'member@example.com',
    })
  })

  it('rejects a profile update that tries to set role', async () => {
    const cookie = cookieFrom(await login('member@example.com', 'member12345'))
    const response = await app.request('/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({
        displayName: 'Member User',
        email: 'member@example.com',
        role: 'admin',
      }),
    })
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ code: 'VALIDATION_ERROR' })
  })
})

describe('schemas', () => {
  it('rejects an invalid login body', async () => {
    const response = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    })
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ code: 'VALIDATION_ERROR' })
  })
})
