'use client'

import { useQuery } from '@tanstack/react-query'
import { getProfile } from '../api/get-profile'
import { profileKeys } from '../model/query-keys'

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: ({ signal }) => getProfile(signal),
  })
}
