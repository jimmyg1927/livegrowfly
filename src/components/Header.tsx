'use client'

import React from 'react'
import { Moon, Sun, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card text-textPrimary shadow-sm">
      <div className="text-lg font-semibold">Growfly</div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted transition"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="p-2 rounded-full hover:bg-muted transition cursor-pointer">
          <User size={20} />
        </div>
      </div>
    </header>
  )
}
