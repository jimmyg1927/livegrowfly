'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useUserStore } from '@lib/store'
import { 
  Sun, 
  Moon, 
  User, 
  Gift, 
  Crown, 
  ChevronDown,
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react'

function getXPLabel(xp: number) {
  if (xp < 25) return { label: 'Curious Cat', icon: '🐱', color: '#94A3B8' }
  if (xp < 150) return { label: 'Nerdlet', icon: '🧪', color: '#60A5FA' }
  if (xp < 500) return { label: 'Prompt Prober', icon: '📈', color: '#34D399' }
  if (xp < 850) return { label: 'Nerdboss', icon: '🧠', color: '#F59E0B' }
  return { label: 'Prompt Commander', icon: '🚀', color: '#EF4444' }
}

function getXPProgress(xp: number) {
  const levelCaps = [25, 150, 500, 850, 1000]
  for (let i = 0; i < levelCaps.length; i++) {
    if (xp < levelCaps[i]) {
      const prev = i === 0 ? 0 : levelCaps[i - 1]
      return {
        progress: ((xp - prev) / (levelCaps[i] - prev)) * 100,
        current: xp - prev,
        needed: levelCaps[i] - xp,
        nextLevel: levelCaps[i]
      }
    }
  }
  return { progress: 100, current: xp, needed: 0, nextLevel: 1000 }
}

function getSubscriptionBadge(type: string) {
  switch (type?.toLowerCase()) {
    case 'pro':
    case 'premium':
      return { label: 'Pro', color: 'bg-gradient-to-r from-amber-400 to-orange-500', icon: Crown }
    case 'team':
      return { label: 'Team', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown }
    default:
      return { label: 'Free', color: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: null }
  }
}

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const user = useUserStore(state => state.user)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

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

  const xpInfo = getXPLabel(user?.totalXP || 0)
  const progressInfo = getXPProgress(user?.totalXP || 0)
  const subscriptionBadge = getSubscriptionBadge(user?.subscriptionType || 'free')

  return (
    <header className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white flex items-center justify-between px-4 sm:px-8 py-4 shadow-lg border-b border-white/10">
      
      {/* Left Section - XP Progress */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{xpInfo.icon}</span>
            <span className="text-sm font-semibold text-white/90 truncate">
              {xpInfo.label}
            </span>
            <span className="text-xs font-medium text-white/70 hidden sm:inline">
              {Math.floor(user?.totalXP || 0)} XP
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-32 sm:w-40 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${progressInfo.progress}%`,
                  background: `linear-gradient(90deg, ${xpInfo.color}, ${xpInfo.color}CC)`,
                  boxShadow: `0 0 8px ${xpInfo.color}40`
                }}
              />
            </div>
            <span className="text-xs text-white/60 hidden sm:inline whitespace-nowrap">
              {progressInfo.needed > 0 ? `${progressInfo.needed} to next` : 'Max level!'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Refer a Friend Button */}
        <Link
          href="/refer"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Gift size={16} />
          <span>Refer & Earn</span>
        </Link>

        {/* Subscription Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full text-white shadow-md ${subscriptionBadge.color}`}>
          {subscriptionBadge.icon && <subscriptionBadge.icon size={14} />}
          <span>{subscriptionBadge.label}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-105"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
            aria-label="Profile menu"
          >
            <User size={18} />
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfileMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.subscriptionType || 'Free'} Plan
                  </p>
                </div>
                
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                
                <Link
                  href="/change-plan"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <CreditCard size={16} />
                  Manage Plan
                </Link>
                
                <Link
                  href="/refer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Gift size={16} />
                  Refer Friends
                </Link>
                
                <hr className="my-2" />
                
                <button
                  onClick={() => {
                    localStorage.removeItem('growfly_jwt')
                    window.location.href = '/login'
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}