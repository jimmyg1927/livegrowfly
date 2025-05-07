'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { useUserStore } from '@/lib/store'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore()
  const pathname = usePathname()
  const hideUI = ['/login', '/signup'].includes(pathname || '')

  // Cast to satisfy HeaderProps
  const xp = (user as any)?.totalXP ?? 0
  const subscriptionType = (user as any)?.subscriptionType ?? 'Free'

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      {!hideUI && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {/* Only one Header at the top, using store values */}
        {!hideUI && <Header xp={xp} subscriptionType={subscriptionType} />}

        <main className={`flex-1 overflow-y-auto ${hideUI ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
