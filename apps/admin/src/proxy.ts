import { SESSION_COOKIE_NAME } from '@platform/auth/types'
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === '/login'
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  if (!hasCookie && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/backend).*)'],
}
