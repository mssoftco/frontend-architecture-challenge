import { http } from '@platform/http'
import { managedUserSchema } from '../schema'

export async function getUser(id: string, signal?: AbortSignal) {
  const payload = await http.get(`/api/backend/admin/users/${id}`, { signal })
  return managedUserSchema.parse(payload)
}
