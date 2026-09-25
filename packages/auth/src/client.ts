'use client'

import { http } from '@platform/http'
import { sessionSchema, type LoginInput, type Session } from './types'

export async function login(input: LoginInput) {
  await http.post('/api/backend/auth/login', input)
}

export async function logout() {
  await http.post('/api/backend/auth/logout')
}

export async function getSession(): Promise<Session> {
  const payload = await http.get('/api/backend/auth/me')
  return sessionSchema.parse(payload)
}
