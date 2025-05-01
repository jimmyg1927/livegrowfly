'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiMessageCircle,
  FiRepeat,
  FiUserPlus,
  FiSettings,
  FiBarChart2,
} from 'react-icons/fi'
import Image from 'next/image'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <FiHome /> },
  { label: 'Feedback', href: '/feedback', icon: <FiMessageCircle /> },
  { label: 'Change Plan', href: '/change-plan', icon: <FiRepeat /> },
  { label: 'Refer a Friend', href: '/refer', icon: <FiUserPlus /> },
  { label: 'Growfly News', href: '/news', icon: <FiBarChart2 /> },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-sidebar h-full flex flex-col text-white py-6 px-4">
      <div className="flex justify-center items-center mb-8">
        <Image
          src="/growfly-logo.png"
          alt="Growfly Logo"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-accent ${
              pathname === item.href ? 'bg-accent text-white' : 'text-gray-300'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-sm text-gray-400 px-3">
        <Link href="/settings" className="flex items-center gap-3 hover:text-white">
          <FiSettings />
          Settings
        </Link>
      </div>
    </aside>
  )
}
