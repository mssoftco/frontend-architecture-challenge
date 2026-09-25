'use client'

import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/get-users'
import type { UserListFilters } from '../model/managed-user'
import { userKeys } from '../model/query-keys'

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: ({ signal }) => getUsers(filters, signal),
  })
}
