import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE_NAME = 'platform_session'
const ONE_HOUR_SECONDS = 60 * 60

function secretKey() {
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === 'production' ? undefined : 'dev-only-change-me')
  if (!secret) {
    throw new Error('AUTH_SECRET is required')
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(userId: string, expiresIn: string | number = '1h') {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey())
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secretKey())
  if (typeof payload.sub !== 'string') {
    throw new Error('Missing subject')
  }
  return { userId: payload.sub }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: ONE_HOUR_SECONDS,
}
