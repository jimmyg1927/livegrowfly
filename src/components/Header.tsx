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
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      <h1 className="text-base font-medium text-foreground truncate max-w-xs sm:max-w-md">
        {name}
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-foreground hover:text-yellow-400 transition"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-foreground font-semibold">
          U
        </div>
      </div>
    </header>
  )
}
