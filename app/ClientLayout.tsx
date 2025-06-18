// File: app/ClientLayout.tsx
'use client'

import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AuthProtection from '../components/AuthProtection'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ''

  // ✅ UPDATED: routes where we do NOT want header/sidebar (including 404)
  const hiddenRoutes = [
    '/onboarding',
    '/signup',
    '/login',
    '/register',
    '/confirm-payment',
    '/payment-success',
    '/forgot-password',
    '/reset-password',
    '/not-found',
    '/404',
    '/contact',
    '/terms',
    '/privacy'
  ]

  // if the current path starts with one of those, just render the page
  const hideChrome = hiddenRoutes.some((route) =>
    pathname.startsWith(route),
  )

  return (
    <AuthProtection>
      {hideChrome ? (
        // ✅ Pages without sidebar/header (login, register, 404, etc.)
        <>{children}</>
      ) : (
        // ✅ Dashboard pages with sidebar/header
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      )}
    </AuthProtection>
  )
}