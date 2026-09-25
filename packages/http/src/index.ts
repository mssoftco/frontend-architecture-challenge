export type ApiErrorBody = {
  code: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  readonly code: string
  readonly details?: unknown
  readonly status: number

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
    this.details = body.details
    this.status = status
  }
}

type Method = 'GET' | 'POST' | 'PATCH'

type RequestOptions = {
  signal?: AbortSignal
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      accept: 'application/json',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options?.signal,
  })

  const text = await response.text()
  const payload: unknown = text ? JSON.parse(text) : null

  if (!response.ok) {
    const errorBody = isApiErrorBody(payload)
      ? payload
      : { code: 'UNKNOWN', message: response.statusText || 'Request failed' }
    throw new ApiError(response.status, errorBody)
  }

  return payload as T
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.code === 'string' && typeof record.message === 'string'
}

export const http = {
  get<T = unknown>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, undefined, options)
  },
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, body, options)
  },
  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, body, options)
  },
}
