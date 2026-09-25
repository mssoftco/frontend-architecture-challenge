import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppProviders } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
