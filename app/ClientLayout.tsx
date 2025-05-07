'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideUI = ['/login', '/signup'].includes(pathname || '')

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      {!hideUI && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {!hideUI && <Header />}
        <main className={`flex-1 overflow-y-auto ${hideUI ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
