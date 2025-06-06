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
  HiOutlineClock,
  HiOutlineAdjustments,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiChevronDown,
} from 'react-icons/hi'
import { FaImages, FaSpinner } from 'react-icons/fa'

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

// ✅ NEW: Generated Image interface
interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  revisedPrompt: string
  size: string
  style: string
  createdAt: string
}

// ✅ NEW: Image Gallery Component for Sidebar
const SidebarImageGallery: React.FC<{
  isCollapsed: boolean
  onImageSelect?: (image: GeneratedImage) => void
}> = ({ isCollapsed, onImageSelect }) => {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  useEffect(() => {
    if (token && expanded) {
      setLoading(true)
      fetch(`${API_BASE_URL}/api/dalle/gallery?limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const galleryImages = data.images?.map((img: any) => ({
            id: img.id,
            url: img.imageUrl,
            originalPrompt: img.prompt,
            revisedPrompt: img.prompt,
            size: img.size,
            style: 'vivid',
            createdAt: img.createdAt
          })) || []
          setImages(galleryImages)
        })
        .catch(err => console.error('Failed to fetch images:', err))
        .finally(() => setLoading(false))
    }
  }, [token, expanded])

  if (isCollapsed) {
    // Collapsed state - show icon only with tooltip
    return (
      <Link
        href="/gallery"
        className="group relative flex items-center justify-center w-full px-3 py-2.5 text-white/90 hover:text-white hover:bg-white/10 hover:shadow-md rounded-lg transition-all duration-200 text-sm font-medium"
        title="Image Gallery"
      >
        <FaImages className="h-5 w-5 flex-shrink-0" />
        
        {/* Tooltip for collapsed state */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          Image Gallery
        </div>
      </Link>
    )
  }

  // Expanded state
  return (
    <div className="mb-2">
      <Link
        href="/gallery"
        className="group relative flex items-center gap-3 w-full px-3 py-2.5 text-white/90 hover:text-white hover:bg-white/10 hover:shadow-md rounded-lg transition-all duration-200 text-sm font-medium"
      >
        <FaImages className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1 text-left">Image Gallery</span>
      </Link>

      {/* ✅ Quick preview section - only show if expanded and have images */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="group relative flex items-center gap-3 w-full px-3 py-1.5 mt-1 text-white/70 hover:text-white/90 hover:bg-white/5 rounded-lg transition-all duration-200 text-xs"
      >
        <span className="ml-8 flex-1 text-left">Quick Preview</span>
        <HiChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="mt-2 ml-8 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <FaSpinner className="animate-spin text-white/60 text-xs" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-white/60 text-xs py-2">No images yet</p>
          ) : (
            <>
              {images.slice(0, 3).map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer"
                  onClick={() => onImageSelect?.(image)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={image.url}
                      alt={image.originalPrompt}
                      className="w-6 h-6 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate leading-tight">{image.originalPrompt}</p>
                      <p className="text-white/60 text-xs">{new Date(image.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {images.length > 3 && (
                <Link 
                  href="/gallery" 
                  className="block w-full text-white/60 hover:text-white text-xs py-1 px-2 text-center hover:bg-white/5 rounded transition-colors"
                >
                  View all {images.length} images →
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

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
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      {showDivider && !isCollapsed && <div className="border-t border-white/10 my-2" />}
      {showDivider && isCollapsed && <div className="w-8 h-px bg-white/10 mx-auto my-2" />}
      {items.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
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
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className={`bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white flex flex-col py-5 min-h-screen shadow-2xl transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-16 sm:w-56'
    }`}>
      
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
        
        {/* Subtle Collapse Toggle - Only visible on larger screens */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden sm:block absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <HiOutlineMenuAlt2 className="w-3 h-3" />
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className={`flex flex-col gap-1 flex-1 transition-all duration-200 ${isCollapsed ? 'px-2' : 'px-2 sm:px-4'}`}>
        {/* Primary Navigation */}
        <NavSection items={navItems} />
        
        {/* ✅ NEW: Image Gallery - positioned after primary nav */}
        <SidebarImageGallery 
          isCollapsed={isCollapsed} 
          onImageSelect={(image) => {
            // Could implement image preview or other actions here
            console.log('Selected image:', image)
          }} 
        />
        
        {/* Secondary Features */}
        <NavSection items={secondaryItems} showDivider={true} />
        
        {/* Settings Group */}
        <NavSection items={settingsItems} showDivider={true} />
      </nav>

      {/* Logout Button */}
      <div className={`w-full pt-4 border-t border-white/10 transition-all duration-200 ${isCollapsed ? 'px-2' : 'px-2 sm:px-4'}`}>
        <button
          onClick={() => {
            localStorage.removeItem('growfly_jwt')
            window.location.href = '/login'
          }}
          className={`group relative flex items-center gap-3 w-full px-3 py-2.5 text-white/90 hover:text-white hover:bg-red-500/20 hover:shadow-md rounded-lg transition-all duration-200 text-sm font-medium ${
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
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  )
}