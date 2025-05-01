'use client'

import { useUserStore } from '../lib/store'
import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function Header() {
  const { user } = useUserStore()
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex justify-between items-center p-4">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Welcome, {user?.name || 'Growfly User'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-white"
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
        <div className="w-8 h-8 bg-gray-400 rounded-full" />
      </div>
    </div>
  )
}
