'use client'

import { ApiError } from '@platform/http'
import { Alert } from '@platform/ui/components/alert'
import { Button } from '@platform/ui/components/button'
import { Card } from '@platform/ui/components/card'
import { Skeleton } from '@platform/ui/components/skeleton'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { UsersFilters } from './users-filters'
import { UsersTable } from './users-table'
import { useUsers } from '../hooks/use-users'

export function UsersScreen() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [role, setRole] = useQueryState('role', parseAsString.withDefault(''))
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(''))
  const query = useUsers({ q, page, role, status })

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <UsersFilters
        q={q}
        role={role}
        status={status}
        onQuery={(value) => {
          void setQ(value)
          void setPage(1)
        }}
        onRole={(value) => {
          void setRole(value)
          void setPage(1)
        }}
        onStatus={(value) => {
          void setStatus(value)
          void setPage(1)
        }}
      />
      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : null}
      {query.error ? (
        <Alert>
          <p>{query.error instanceof ApiError ? query.error.message : 'Could not load users'}</p>
          <Button className="mt-3" variant="secondary" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}
      {query.data && query.data.items.length === 0 ? (
        <Card>No users match these filters.</Card>
      ) : null}
      {query.data && query.data.items.length > 0 ? (
        <>
          <UsersTable users={query.data.items} />
          <div className="flex items-center justify-between text-sm">
            <span>
              Page {query.data.page} of {Math.max(1, Math.ceil(query.data.total / query.data.pageSize))}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => void setPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page * query.data.pageSize >= query.data.total}
                onClick={() => void setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
