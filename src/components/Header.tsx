'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useUserStore } from '@lib/store'
import { Sun, Moon } from 'lucide-react'

function getXPLabel(xp: number) {
  if (xp < 25) return '🐣 Curious Cat'
  if (xp < 150) return '🧪 Nerdlet'
  if (xp < 500) return '📈 Prompt Prober'
  if (xp < 850) return '🧠 Nerdboss'
  return '🚀 Prompt Commander'
}

function getXPProgress(xp: number) {
  const levelCaps = [25, 150, 500, 850, 1000]
  for (let i = 0; i < levelCaps.length; i++) {
    if (xp < levelCaps[i]) {
      const prev = i === 0 ? 0 : levelCaps[i - 1]
      return ((xp - prev) / (levelCaps[i] - prev)) * 100
    }
  }
  return 100
}

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const user = useUserStore(state => state.user)

  const hiddenRoutes = [
    '/login',
    '/signup',
    '/register',
    '/onboarding',
    '/payment-success',
    '/confirm-payment',
    '/forgot-password',
    '/contact',
  ]

  if (!pathname || hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null
  }

  return (
    <header className="w-full bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white flex items-center justify-between px-4 sm:px-8 py-3 shadow">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {getXPLabel(user?.totalXP || 0)} — {Math.floor(user?.totalXP || 0)} XP
          </span>
          <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden mt-1">
            <div
              className="h-full transition-all"
              style={{
                width: `${getXPProgress(user?.totalXP || 0)}%`,
                backgroundColor: '#FFD700',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/refer"
          className="hidden sm:inline-block px-3 py-1 text-sm font-medium rounded-full bg-white text-[#1992FF] hover:brightness-105 transition"
        >
          🎁 Refer a Friend
        </Link>
        <span className="hidden sm:inline-block px-3 py-1 text-sm font-medium rounded-full bg-white text-[#1992FF] capitalize">
          Subscription: {user?.subscriptionType || 'free'}
        </span>
        <Link
          href="/settings"
          className="p-2 bg-white text-[#1992FF] rounded-full hover:brightness-105 shadow"
        >
          <span className="sr-only">Profile</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="bg-white text-[#1992FF] p-2 rounded-full shadow hover:brightness-105 transition"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
