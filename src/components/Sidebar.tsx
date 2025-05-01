'use client'

import React from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Settings,
  ThumbsUp,
  Users,
  Newspaper,
  Gift,
} from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-60 bg-primary text-white h-screen p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-10">
          <img src="/growfly-logo.png" alt="Growfly" className="h-6 w-auto" />
        </div>
        <nav className="space-y-4 text-sm">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:text-accent">
            <MessageCircle size={18} /> <span>Dashboard</span>
          </Link>
          <Link href="/feedback" className="flex items-center space-x-2 hover:text-accent">
            <ThumbsUp size={18} /> <span>Feedback</span>
          </Link>
          <Link href="/change-plan" className="flex items-center space-x-2 hover:text-accent">
            <Users size={18} /> <span>Change Plan</span>
          </Link>
          <Link href="/refer" className="flex items-center space-x-2 hover:text-accent">
            <Gift size={18} /> <span>Refer a Friend</span>
          </Link>
          <Link href="/growfly-news" className="flex items-center space-x-2 hover:text-accent">
            <Newspaper size={18} /> <span>Growfly News</span>
          </Link>
        </nav>
      </div>
      <div className="text-sm">
        <Link href="/settings" className="flex items-center space-x-2 hover:text-accent">
          <Settings size={18} /> <span>Settings</span>
        </Link>
      </div>
    </aside>
  )
}
