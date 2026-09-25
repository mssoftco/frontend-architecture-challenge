import { http } from '@platform/http'
import { managedUserSchema, type UpdateManagedUser } from '../schema'

export async function updateUser(id: string, input: UpdateManagedUser) {
  const payload = await http.patch(`/api/backend/admin/users/${id}`, input)
  return managedUserSchema.parse(payload)
}
