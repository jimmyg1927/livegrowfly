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
} from 'react-icons/hi'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
  { name: 'Collab Zone', href: '/collab-zone', icon: HiOutlineUserGroup },
  { name: 'Saved', href: '/saved', icon: HiOutlineDocumentText },
  { name: 'Nerdify Me!', href: '/nerd-mode', icon: HiOutlineLightBulb },
  { name: 'Settings', href: '/settings', icon: HiOutlineCog },
  { name: 'Change Plan', href: '/plans', icon: HiOutlineCurrencyPound },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-[#1992ff] text-white w-20 sm:w-64 flex flex-col items-center sm:items-start py-6 px-2 sm:px-4 min-h-screen">
      {/* Logo */}
      <div className="mb-10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/growfly-logo.png"
            alt="Growfly"
            className="w-15 h-15 sm:w-18 sm:h-18 object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 w-full">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition text-sm font-medium ${
              pathname === item.href
                ? 'bg-white text-black shadow'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="hidden sm:inline">{item.name}</span>
          </Link>
        ))}
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
