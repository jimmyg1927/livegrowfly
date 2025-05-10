'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages that should hide BOTH Sidebar and Header
  const hideUI = ['/login', '/signup', '/register'].includes(pathname || '')

  // Pages that should show Sidebar but hide the Header (e.g., because it's already included in page)
  const hideHeaderOnly = ['/refer', '/trusted-partners'].includes(pathname || '')

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      {!hideUI && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {!hideUI && !hideHeaderOnly && <Header />}
        <main className={`flex-1 overflow-y-auto ${hideUI ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
