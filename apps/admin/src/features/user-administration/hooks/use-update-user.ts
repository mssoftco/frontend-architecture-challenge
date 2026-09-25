'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../api/update-user'
import { userKeys } from '../model/query-keys'
import type { UpdateManagedUser } from '../schema'

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateManagedUser) => updateUser(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
