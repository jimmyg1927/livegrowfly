'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FiSettings } from 'react-icons/fi'
import {
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineNewspaper,
  HiOutlineSwitchHorizontal,
  HiOutlineThumbUp,
  HiOutlineLightBulb
} from 'react-icons/hi'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineSparkles },
  { name: 'Feedback', href: '/feedback', icon: HiOutlineThumbUp },
  { name: 'Change Plan', href: '/plans', icon: HiOutlineSwitchHorizontal },
  { name: 'Refer a Friend', href: '/refer', icon: HiOutlineUserGroup },
  { name: 'Growfly News', href: '/news', icon: HiOutlineNewspaper },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-white flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <Image
            src="/growfly-bot.png"
            alt="Growfly Bot"
            width={64}
            height={64}
            className="rounded-full"
          />
        </div>
        <nav className="space-y-2 mt-4 px-4">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link href={href} key={name}>
              <div
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                  pathname === href
                    ? 'bg-active text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {name}
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-4 py-6">
        <Link
          href="/settings"
          className="flex items-center text-sm text-gray-400 hover:text-white"
        >
          <FiSettings className="mr-2" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
