'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, User } from 'lucide-react'

interface HeaderProps {
  name?: string
  hideUser?: boolean
}

export default function Header({ name, hideUser }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="flex justify-between items-center mb-4">
      {!hideUser && (
        <div className="text-lg font-semibold flex items-center gap-2 text-textPrimary">
          <User size={20} />
          {name}
        </div>
      )}

      <button
        onClick={toggleTheme}
        className="bg-card text-textPrimary p-2 rounded hover:opacity-80 transition"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  )
}
