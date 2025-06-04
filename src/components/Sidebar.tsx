'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineHome,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineCurrencyPound,
  HiOutlineLightBulb,
  HiOutlineHeart,
  HiOutlineUserAdd,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineAdjustments,
} from 'react-icons/hi'

// Reordered by usage frequency and logical grouping
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
  { name: 'Chat History', href: '/recent-chats', icon: HiOutlineClock },
  { name: 'Collab Zone', href: '/collab-zone', icon: HiOutlineUserGroup },
  { name: 'Saved Chats', href: '/saved', icon: HiOutlineDocumentText },
  { name: 'Wishlist', href: '/wishlist', icon: HiOutlineHeart },
]

// Secondary features - less frequently used
const secondaryItems = [
  { name: 'Education Hub', href: '/nerd-mode', icon: HiOutlineLightBulb },
  { name: 'Refer a Friend', href: '/refer', icon: HiOutlineUserAdd },
  { name: 'Change Plan', href: '/change-plan', icon: HiOutlineCurrencyPound },
]

// Settings group - typically accessed less often
const settingsItems = [
  { name: 'Settings', href: '/settings', icon: HiOutlineCog },
  { name: 'Brand Settings', href: '/brand-settings', icon: HiOutlineAdjustments },
  { name: 'Trusted Partners', href: '/trusted-partners', icon: HiOutlineShieldCheck },
]

export default function Sidebar() {
  const pathname = usePathname() || ''

  const hiddenRoutes = [
    '/onboarding',
    '/signup',
    '/login',
    '/register',
    '/confirm-payment',
    '/payment-success',
    '/forgot-password',
    '/contact',
  ]
  
  if (hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null
  }

  const NavSection = ({ items, showDivider = false }) => (
    <>
      {showDivider && <div className="border-t border-white/10 my-2" />}
      {items.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
              isActive
                ? 'bg-white text-[#0f172a] shadow-lg font-semibold transform scale-[0.98]'
                : 'text-white/90 hover:text-white hover:bg-white/10 hover:shadow-md hover:transform hover:scale-[0.99]'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isActive ? 'text-[#0f172a]' : ''}`} />
            <span className="hidden sm:inline">{item.name}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white w-20 sm:w-64 flex flex-col items-center sm:items-start py-6 px-3 sm:px-5 min-h-screen shadow-2xl">
      {/* Logo Section */}
      <div className="mb-8 w-full flex justify-center">
        <Link href="/dashboard" className="group">
          <img
            src="/growfly-logo.png"
            alt="growfly"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 w-full flex-1">
        {/* Primary Navigation */}
        <NavSection items={navItems} />
        
        {/* Secondary Features */}
        <NavSection items={secondaryItems} showDivider={true} />
        
        {/* Settings Group */}
        <NavSection items={settingsItems} showDivider={true} />
      </nav>

      {/* Logout Button */}
      <div className="w-full pt-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem('growfly_jwt')
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-white/90 hover:text-white hover:bg-red-500/20 hover:shadow-md rounded-xl transition-all duration-200 text-sm font-medium group"
        >
          <HiOutlineLogout className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  )
}