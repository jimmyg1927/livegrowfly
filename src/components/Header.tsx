'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface HeaderProps {
  name?: string
}

export default function Header({ name }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between p-4 bg-background text-textPrimary shadow-sm">
      <div className="text-sm">
        {name ? `Logged in as: ${name}` : null}
      </div>
      <button
        onClick={toggleTheme}
        className="flex items-center space-x-2 bg-card px-3 py-1 rounded hover:opacity-90"
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        <span className="text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>
    </header>
  )
}
