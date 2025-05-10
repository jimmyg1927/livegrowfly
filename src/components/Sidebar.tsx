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
} from 'react-icons/hi'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
  { name: 'Saved', href: '/saved', icon: HiOutlineDocumentText },
  { name: 'Collab Zone', href: '/collab-zone', icon: HiOutlineUserGroup },
  { name: 'Wishlist', href: '/wishlist', icon: HiOutlineHeart },
  { name: 'Nerdify Me!', href: '/nerd-mode', icon: HiOutlineLightBulb },
  { name: 'Refer a Friend', href: '/refer', icon: HiOutlineUserAdd }, // ✅ New tab
  { name: 'Change Plan', href: '/plans', icon: HiOutlineCurrencyPound },
  { name: 'Settings', href: '/settings', icon: HiOutlineCog },
  { name: 'Brand Settings', href: '/brand-settings', icon: HiOutlineCog },
  { name: 'Trusted Partners', href: '/trusted-partners', icon: HiOutlineShieldCheck }, // ✅ New tab
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-[#1992ff] text-white w-20 sm:w-56 flex flex-col items-center sm:items-start py-5 px-2 sm:px-4 min-h-screen">
      
      {/* Logo */}
      <div className="mb-4 w-full flex justify-center sm:justify-center">
        <Link href="/dashboard" className="w-full flex justify-center">
          <img
            src="/growfly-logo.png"
            alt="Growfly"
            className="w-20 h-20 object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition text-sm font-medium ${
                isActive
                  ? 'bg-white text-black shadow'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto w-full">
        <button
          onClick={() => {
            localStorage.removeItem('growfly_jwt')
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 w-full px-4 py-2 text-white hover:bg-white/20 rounded-md transition text-sm font-medium"
        >
          <HiOutlineLogout className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  )
}
