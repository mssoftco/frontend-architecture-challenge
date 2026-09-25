import type { ManagedUser } from '../schema'

export type { ManagedUser }

export type UserListFilters = {
  q: string
  page: number
  role: string
  status: string
}
