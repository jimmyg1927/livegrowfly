// app/ClientLayout.tsx
'use client'

import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ''

  // routes where we do NOT want header/sidebar
  const hiddenRoutes = [
    '/onboarding',
    '/signup',
    '/login',
    '/confirm-payment',
    '/payment-success',
  ]

  // if the current path starts with one of those, just render the page
  const hideChrome = hiddenRoutes.some((route) =>
    pathname.startsWith(route),
  )
  if (hideChrome) {
    return <>{children}</>
  }

  // otherwise render your normal dashboard chrome
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
