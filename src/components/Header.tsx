'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useUserStore } from '@lib/store'
import { 
  Sun, 
  Moon, 
  User as UserIcon, 
  Gift, 
  Crown, 
  ChevronDown,
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react'

// ✅ Helper functions for subscription validation
function hasValidSubscription(user) {
  if (!user) return false
  if (user.subscriptionType === 'free') return true
  return !!(user.stripeCustomerId || user.billingStartDate)
}

function getEffectiveSubscription(user) {
  if (!user) return 'free'
  return hasValidSubscription(user) ? user.subscriptionType : 'free'
}

function getXPLabel(xp) {
  if (xp < 25) return { label: 'Curious Cat', icon: '🐱', color: '#94A3B8' }
  if (xp < 150) return { label: 'Nerdlet', icon: '🧪', color: '#60A5FA' }
  if (xp < 500) return { label: 'Prompt Prober', icon: '📈', color: '#34D399' }
  if (xp < 850) return { label: 'Nerdboss', icon: '🧠', color: '#F59E0B' }
  return { label: 'Prompt Commander', icon: '🚀', color: '#EF4444' }
}

function getXPProgress(xp) {
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

function getSubscriptionBadge(user) {
  if (!user) return { label: 'Free', color: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: null }
  
  const effectivePlan = getEffectiveSubscription(user)
  
  switch (effectivePlan?.toLowerCase()) {
    case 'personal':
      return { label: 'Personal', color: 'bg-gradient-to-r from-blue-500 to-indigo-500', icon: Crown }
    case 'business':
      return { label: 'Business', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown }
    case 'enterprise':
      return { label: 'Enterprise', color: 'bg-gradient-to-r from-amber-400 to-orange-500', icon: Crown }
    default:
      return { label: 'Free', color: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: null }
  }
}

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const user = useUserStore(state => state.user)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // ✅ UPDATED: Added 404 routes to hidden routes
  const hiddenRoutes = [
    '/login',
    '/signup',
    '/register',
    '/onboarding',
    '/payment-success',
    '/confirm-payment',
    '/forgot-password',
    '/contact',
    '/404',
    '/not-found',
  ]

  // ✅ Also check if current pathname is a 404 page
  const is404Page = pathname === '/404' || pathname === '/not-found' || 
                   (typeof document !== 'undefined' && (document?.title?.includes('404') || document?.title?.includes('Not Found')))

  if (!pathname || hiddenRoutes.some(route => pathname.startsWith(route)) || is404Page) {
    return null
  }

  // ✅ Early return if user is not loaded yet
  if (!user) {
    return (
      <header className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white flex items-center justify-between px-4 sm:px-8 py-4 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/60">Loading...</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-105"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
    )
  }

  // ✅ Calculate all values outside JSX
  const effectiveSubscription = getEffectiveSubscription(user)
  const xpInfo = getXPLabel(user.totalXP || 0)
  const progressInfo = getXPProgress(user.totalXP || 0)
  const subscriptionBadge = getSubscriptionBadge(user)

  // ✅ Pre-calculate XP display values
  const totalXP = Math.floor(user.totalXP || 0)
  const xpPercentage = progressInfo.progress
  
  const xpProgressStyle = {
    width: xpPercentage + '%',
    background: 'linear-gradient(90deg, ' + xpInfo.color + ', ' + xpInfo.color + 'CC)',
    boxShadow: '0 0 8px ' + xpInfo.color + '40'
  }

  const neededText = progressInfo.needed > 0 ? progressInfo.needed + ' to next level' : 'Max level!'

  return (
    <header className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white flex items-center justify-between px-4 sm:px-8 py-4 shadow-lg border-b border-white/10">
      
      {/* Left Section - XP Progress Only */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{xpInfo.icon}</span>
            <span className="text-sm font-semibold text-white/90 truncate">
              {xpInfo.label}
            </span>
            <span className="text-xs font-medium text-white/70 hidden sm:inline">
              {totalXP} XP
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-32 sm:w-40 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={xpProgressStyle}
              />
            </div>
            <span className="text-xs text-white/60 hidden sm:inline whitespace-nowrap">
              {neededText}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ REMOVED: Center Section - Usage Stats (Prompts Used & Images) */}
      
      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Refer a Friend Button */}
        <Link
          href="/refer"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Gift size={16} />
          <span>Refer & Earn</span>
        </Link>

        {/* Subscription Badge */}
        <div className={'hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full text-white shadow-md ' + subscriptionBadge.color}>
          {subscriptionBadge.icon && React.createElement(subscriptionBadge.icon, { size: 14 })}
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
            <UserIcon size={18} />
            <ChevronDown 
              size={14} 
              className={'transition-transform duration-200 ' + (showProfileMenu ? 'rotate-180' : '')}
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email || 'User'}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 capitalize">
                      {effectiveSubscription} Plan
                    </p>
                    {effectiveSubscription !== 'free' && hasValidSubscription(user) && (
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs">Active</span>
                      </div>
                    )}
                    {effectiveSubscription !== 'free' && !hasValidSubscription(user) && (
                      <div className="flex items-center gap-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs">Payment Required</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    🎨 View usage details in Settings
                  </div>
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
                  {effectiveSubscription === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
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