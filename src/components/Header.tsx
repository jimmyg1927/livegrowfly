'use client'

import React from 'react'
import { Sun, Moon, UserCircle, Gift } from 'lucide-react'
import { useUserStore } from '@/lib/store'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { usePathname } from 'next/navigation'

function getNerdLevel(xp: number = 0) {
  if (xp < 25) return { title: 'Curious Cat', emoji: '🐱', max: 25 }
  if (xp < 150) return { title: 'Nerdlet', emoji: '🧪', max: 150 }
  if (xp < 500) return { title: 'Prompt Prober', emoji: '🧠', max: 500 }
  if (xp < 850) return { title: 'Nerdboss', emoji: '🧙‍♂️', max: 850 }
  return { title: 'Prompt Commander', emoji: '🚀', max: 1000 }
}

export default function Header() {
  // __ALWAYS__ call hooks at the top
  const { theme, toggleTheme } = useTheme()
  const xp = useUserStore((state) => state.xp)
  const subscriptionType = useUserStore((state) => state.subscriptionType)
  const pathname = usePathname() || ''

  // then compute derived state
  const { title, emoji, max } = getNerdLevel(xp)
  const progress = Math.min((xp / max) * 100, 100)
  const hiddenRoutes = ['/onboarding', '/signup', '/login', '/confirm-payment', '/payment-success']

  // __AFTER__ hooks, you can conditionally bail
  if (hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null
  }

  return (
    <header className="flex items-center justify-between bg-[#1992ff] text-white px-6 py-4 shadow-md rounded-bl-2xl transition-all">
      <div className="flex items-center gap-6">
        <div className="text-lg font-semibold">
          {emoji} {title} — {Math.floor(xp)} XP
        </div>
        <div className="w-48 bg-white/30 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/refer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm font-medium transition">
          <Gift size={16} />
          Refer a Friend
        </Link>
        <Link href="/change-plan">
          <span className="px-3 py-1 rounded-full border border-white text-sm font-medium bg-white/10 hover:bg-white/20 transition">
            Subscription: {subscriptionType.toLowerCase()}
          </span>
        </Link>
        <Link href="/settings" title="Settings">
          <UserCircle className="w-6 h-6 text-white hover:text-white/80 transition" />
        </Link>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="bg-white text-[#1992ff] p-2 rounded-full shadow hover:brightness-105 transition"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
