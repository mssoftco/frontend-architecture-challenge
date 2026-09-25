'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from '../api/update-profile'
import { profileKeys } from '../model/query-keys'
import type { UpdateProfile } from '../schema'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfile) => updateProfile(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
    },
  })
}
