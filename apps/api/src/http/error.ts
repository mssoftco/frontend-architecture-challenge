import type { Context } from 'hono'

export type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'USER_NOT_FOUND'

export function errorBody(code: ErrorCode, message: string, details?: unknown) {
  return details === undefined ? { code, message } : { code, message, details }
}

export function jsonError(
  c: Context,
  status: 400 | 401 | 403 | 404,
  code: ErrorCode,
  message: string,
  details?: unknown,
) {
  return c.json(errorBody(code, message, details), status)
}
