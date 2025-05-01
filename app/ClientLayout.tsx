'use client'

import React from 'react'
import Sidebar from '../src/components/Sidebar'
import Header from '../src/components/Header'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-textPrimary">
      {/* SINGLE Sidebar instance */}
      <aside className="w-64">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="flex items-center justify-between bg-card px-6 py-4 shadow-sm">
          <Header />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
