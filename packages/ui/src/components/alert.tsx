import { cn } from '@platform/ui/lib/cn'
import type { HTMLAttributes } from 'react'

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn('rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700', className)}
      {...props}
    />
  )
}
