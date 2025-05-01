'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { FiSun, FiMoon } from 'react-icons/fi'

interface HeaderProps {
  name: string
}

export default function Header({ name }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <h1 className="text-xl font-semibold text-white">{name}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-white hover:text-yellow-400"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
          U
        </div>
      </div>
    </header>
  )
}
