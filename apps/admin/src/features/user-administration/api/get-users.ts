import { http } from '@platform/http'
import { managedUserListSchema } from '../schema'
import type { UserListFilters } from '../model/managed-user'

export async function getUsers(filters: UserListFilters, signal?: AbortSignal) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  if (filters.q) params.set('q', filters.q)
  if (filters.role) params.set('role', filters.role)
  if (filters.status) params.set('status', filters.status)
  const payload = await http.get(`/api/backend/admin/users?${params.toString()}`, { signal })
  return managedUserListSchema.parse(payload)
}
