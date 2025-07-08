'use client'

import React, { useState, useEffect } from 'react'
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
  HiOutlineAdjustments,
  HiOutlineMenuAlt2,
  HiOutlineMail, // Added for email icon
} from 'react-icons/hi'
import { FaImages } from 'react-icons/fa'

// ✅ UPDATED: Gallery component with data-tutorial attribute for tutorial targeting
const SimpleImageGallery: React.FC<{
  isCollapsed: boolean
}> = ({ isCollapsed }) => {
  if (isCollapsed) {
    // Collapsed state - show icon only with tooltip
    return (
      <Link
        href="/gallery"
        data-nav="gallery"
        data-tutorial="Gallery"
        className="group relative flex items-center justify-center w-full px-3 py-2.5 text-white/90 hover:text-white hover:bg-white/10 hover:shadow-md rounded-xl transition-all duration-200 text-sm font-medium"
        title="Image Gallery"
      >
        <FaImages className="h-5 w-5 flex-shrink-0" />
        
        {/* Tooltip for collapsed state */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          Image Gallery
        </div>
      </Link>
    )
  }

  // Expanded state - simple link only
  return (
    <Link
      href="/gallery"
      data-nav="gallery"
      data-tutorial="Gallery"
      className="group relative flex items-center gap-3 w-full px-3 py-2.5 text-white/90 hover:text-white hover:bg-white/10 hover:shadow-md rounded-xl transition-all duration-200 text-sm font-medium"
    >
      <FaImages className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 text-left">Gallery</span>
    </Link>
  )
}

// ✅ UPDATED: Navigation items with data-tutorial attributes for tutorial targeting
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineHome, dataNa: 'dashboard', tutorialTarget: 'Dashboard' },
  { name: 'Collab Zone', href: '/collab-zone', icon: HiOutlineUserGroup, dataNa: 'collab-zone', tutorialTarget: 'Collab Zone' },
  { name: 'Saved Responses', href: '/saved', icon: HiOutlineDocumentText, dataNa: 'saved-responses', tutorialTarget: 'Saved Responses' },
  { name: 'Wishlist', href: '/wishlist', icon: HiOutlineHeart, dataNa: 'wishlist', tutorialTarget: 'Wishlist' },
]

// Secondary features - less frequently used
const secondaryItems = [
  { name: 'Education Hub', href: '/nerd-mode', icon: HiOutlineLightBulb, dataNa: 'education-hub' },
  { name: 'Refer a Friend', href: '/refer', icon: HiOutlineUserAdd, dataNa: 'refer' },
  { name: 'Change Plan', href: '/change-plan', icon: HiOutlineCurrencyPound, dataNa: 'change-plan' },
]

// ✅ NEW: Email item positioned above settings
const emailItems = [
  { 
    name: 'Email', 
    href: '/email', 
    icon: HiOutlineMail, 
    dataNa: 'email', 
    tutorialTarget: 'Email',
    isComingSoon: true 
  },
]

// Settings group - typically accessed less often
const settingsItems = [
  { name: 'Settings', href: '/settings', icon: HiOutlineCog, dataNa: 'settings' },
  { name: 'Brand Settings', href: '/brand-settings', icon: HiOutlineAdjustments, dataNa: 'brand-settings' },
  { name: 'Trusted Partners', href: '/trusted-partners', icon: HiOutlineShieldCheck, dataNa: 'trusted-partners' },
]

export default function Sidebar() {
  const pathname = usePathname() || ''
  const [isCollapsed, setIsCollapsed] = useState(false)

  // ✅ UPDATED: Added 404 routes to hidden routes
  const hiddenRoutes = [
    '/onboarding',
    '/signup',
    '/login',
    '/register',
    '/confirm-payment',
    '/payment-success',
    '/forgot-password',
    '/contact',
    '/404',
    '/not-found',
  ]
  
  // ✅ Also check if current pathname is a 404 page (Next.js sometimes uses different patterns)
  const is404Page = pathname === '/404' || pathname === '/not-found' || 
                   document?.title?.includes('404') || document?.title?.includes('Not Found')
  
  if (hiddenRoutes.some(route => pathname.startsWith(route)) || is404Page) {
    return null
  }

  const NavSection = ({ items, showDivider = false }) => (
    <>
      {showDivider && !isCollapsed && <div className="border-t border-white/10 my-2" />}
      {showDivider && isCollapsed && <div className="w-8 h-px bg-white/10 mx-auto my-2" />}
      {items.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            data-nav={item.dataNa}
            data-tutorial={item.tutorialTarget}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
              isActive
                ? 'bg-white text-[#0f172a] shadow-lg font-semibold'
                : 'text-white/90 hover:text-white hover:bg-white/10 hover:shadow-md'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.name : ''}
          >
            <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#0f172a]' : ''}`} />
            <span className={`transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}`}>
              {item.name}
            </span>
            
            {/* Coming Soon Badge for Email */}
            {item.isComingSoon && !isCollapsed && (
              <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-semibold shadow-sm">
                Soon
              </div>
            )}
            
            {/* Coming soon badge for collapsed state */}
            {item.isComingSoon && isCollapsed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-white/20 animate-pulse"></div>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.name}
                {item.isComingSoon && <div className="text-yellow-400 text-xs">Coming Soon</div>}
              </div>
            )}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      <div 
        data-sidebar
        className={`bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white flex flex-col py-5 min-h-screen shadow-2xl transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-16 sm:w-56'
        }`}
      >
        
        {/* Logo Section */}
        <div className="mb-6 w-full flex justify-center relative group">
          <Link href="/dashboard" className="group">
            <img
              src="/growfly-logo.png"
              alt="growfly"
              className={`object-contain transition-all duration-300 group-hover:scale-105 ${
                isCollapsed ? 'w-10 h-10' : 'w-12 h-12 sm:w-16 sm:h-16'
              }`}
            />
          </Link>
          
          {/* ✅ UPDATED: More Subtle and Friendly Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden sm:block absolute -right-1 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg p-1.5 transition-all duration-200 hover:shadow-sm ${
              isCollapsed ? 'opacity-70 hover:opacity-100' : 'opacity-50 group-hover:opacity-80'
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <HiOutlineMenuAlt2 className="w-3.5 h-3.5" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className={`flex flex-col gap-1 flex-1 transition-all duration-200 ${isCollapsed ? 'px-2' : 'px-2 sm:px-4'}`}>
          {/* Primary Navigation */}
          <NavSection items={navItems} />
          
          {/* ✅ SIMPLIFIED: Gallery - just a simple link, no quick preview */}
          <SimpleImageGallery isCollapsed={isCollapsed} />
          
          {/* Secondary Features */}
          <NavSection items={secondaryItems} showDivider={true} />
          
          {/* ✅ NEW: Email Section - positioned above settings */}
          <NavSection items={emailItems} showDivider={true} />
          
          {/* Settings Group */}
          <NavSection items={settingsItems} showDivider={false} />
        </nav>

        {/* ✅ UPDATED: Logout Button with Better rounded Corners */}
        <div className={`w-full pt-4 border-t border-white/10 transition-all duration-200 ${isCollapsed ? 'px-2' : 'px-2 sm:px-4'}`}>
          <button
            onClick={() => {
              localStorage.removeItem('growfly_jwt')
              window.location.href = '/login'
            }}
            className={`group relative flex items-center gap-3 w-full px-3 py-2.5 text-white/90 hover:text-white hover:bg-red-500/20 hover:shadow-lg rounded-xl transition-all duration-200 text-sm font-medium border border-transparent hover:border-red-500/20 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <HiOutlineLogout className="h-5 w-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
            <span className={`transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}`}>
              Logout
            </span>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  )
}