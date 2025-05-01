'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { useUserStore } from '@/lib/store'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore()

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user?.name || ''} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
