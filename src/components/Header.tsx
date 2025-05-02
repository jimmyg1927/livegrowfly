'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { FiSun, FiMoon, FiUser } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  name: string
}

export default function Header({ name }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <h1 className="text-xl font-semibold text-white">{name}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-white hover:text-yellow-400"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FiMoon size={22} /> : <FiSun size={22} />}
        </button>
        <button
          onClick={() => router.push('/settings')}
          className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-gray-500 transition"
          aria-label="Go to Settings"
        >
          <FiUser size={18} />
        </button>
      </div>
    </header>
  )
}
