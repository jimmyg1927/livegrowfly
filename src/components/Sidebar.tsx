// src/components/Sidebar.tsx
import Link from 'next/link'
import { MessageCircle, ThumbsUp, Users, Settings, Newspaper } from 'lucide-react'
import growflyLogo from '@/public/growfly-logo.png'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-background text-textPrimary flex flex-col p-6">
      <div className="flex items-center space-x-2 mb-10">
        <img src={growflyLogo.src} alt="Growfly Logo" className="h-8 w-auto" />
        <span className="text-2xl font-bold">Growfly</span>
      </div>
      <nav className="flex-1 space-y-4">
        <Link href="/dashboard" className="flex items-center space-x-2 p-2 rounded hover:bg-accent hover:text-background">
          <MessageCircle size={20} /> <span>Dashboard</span>
        </Link>
        <Link href="/feedback" className="flex items-center space-x-2 p-2 rounded hover:bg-accent hover:text-background">
          <ThumbsUp size={20} /> <span>Feedback</span>
        </Link>
        <Link href="/change-plan" className="flex items-center space-x-2 p-2 rounded hover:bg-accent hover:text-background">
          <Users size={20} /> <span>Change Plan</span>
        </Link>
        <Link href="/settings" className="flex items-center space-x-2 p-2 rounded hover:bg-accent hover:text-background">
          <Settings size={20} /> <span>Settings</span>
        </Link>
        <Link href="/growfly-news" className="flex items-center space-x-2 p-2 rounded hover:bg-accent hover:text-background">
          <Newspaper size={20} /> <span>Growfly News</span>
        </Link>
      </nav>
    </aside>
  )
}
