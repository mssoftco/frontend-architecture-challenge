import { http } from '@platform/http'
import { profileSchema, type UpdateProfile } from '../schema'

export async function updateProfile(input: UpdateProfile) {
  const payload = await http.patch('/api/backend/profile', input)
  return profileSchema.parse(payload)
}
