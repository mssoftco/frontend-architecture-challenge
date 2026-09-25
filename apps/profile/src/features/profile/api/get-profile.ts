import { http } from '@platform/http'
import { profileSchema } from '../schema'

export async function getProfile(signal?: AbortSignal) {
  const payload = await http.get('/api/backend/profile', { signal })
  return profileSchema.parse(payload)
}
