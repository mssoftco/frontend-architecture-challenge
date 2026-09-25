'use client'

import { Button } from '@platform/ui/components/button'
import { Input } from '@platform/ui/components/input'
import { Select } from '@platform/ui/components/select'

type Filters = {
  q: string
  role: string
  status: string
  onQuery: (value: string) => void
  onRole: (value: string) => void
  onStatus: (value: string) => void
}

export function UsersFilters({ q, role, status, onQuery, onRole, onStatus }: Filters) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem_auto]">
      <Input
        aria-label="Search users"
        placeholder="Search name or email"
        value={q}
        onChange={(event) => onQuery(event.target.value)}
      />
      <Select aria-label="Role" value={role} onChange={(event) => onRole(event.target.value)}>
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </Select>
      <Select aria-label="Status" value={status} onChange={(event) => onStatus(event.target.value)}>
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </Select>
      <Button
        variant="secondary"
        onClick={() => {
          onQuery('')
          onRole('')
          onStatus('')
        }}
      >
        Clear
      </Button>
    </div>
  )
}
