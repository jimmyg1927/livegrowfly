// File: components/Sidebar.tsx

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
} from 'react-icons/hi'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
  { name: 'Collab Zone', href: '/collab-zone', icon: HiOutlineUserGroup },
  { name: 'Saved', href: '/saved', icon: HiOutlineDocumentText },
  { name: 'Settings', href: '/settings', icon: HiOutlineCog },
  { name: 'Change Plan', href: '/plans', icon: HiOutlineCurrencyPound },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-[#dbeafe] text-black w-20 sm:w-60 flex flex-col items-center sm:items-start py-6 px-2 sm:px-4 border-r border-blue-300">
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
      <nav className="flex flex-col gap-4 w-full">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 p-2 rounded-md transition text-sm font-medium ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-blue-900 hover:bg-blue-100 hover:text-blue-700'
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
          className="flex items-center gap-3 w-full p-2 text-blue-800 hover:text-white hover:bg-blue-600 rounded-md transition"
        >
          <HiOutlineLogout className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  )
}
