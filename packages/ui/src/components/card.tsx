import { cn } from '@platform/ui/lib/cn'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-zinc-200 bg-white p-6 shadow-sm', className)}
      {...props}
    />
  )
}
