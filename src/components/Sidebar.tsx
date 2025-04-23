'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Settings, ThumbsUp, Users, Newspaper } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="bg-black text-white w-64 p-6 flex flex-col space-y-6">
      {/* 🔵 Logo Top Left */}
      <div className="flex items-center space-x-3">
        <Image src="/logo.png" alt="Growfly Logo" width={120} height={40} priority />
      </div>

      {/* 🧭 Navigation */}
      <ul className="space-y-4 mt-8">
        <li>
          <Link href="/dashboard" className="flex items-center space-x-2 hover:text-blue-400">
            <MessageCircle size={18} />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/feedback" className="flex items-center space-x-2 hover:text-blue-400">
            <ThumbsUp size={18} />
            <span>Feedback</span>
          </Link>
        </li>
        <li>
          <Link href="/change-plan" className="flex items-center space-x-2 hover:text-blue-400">
            <Users size={18} />
            <span>Change Plan</span>
          </Link>
        </li>
        <li>
          <Link href="/settings" className="flex items-center space-x-2 hover:text-blue-400">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </li>
        <li>
          <Link href="/growfly-news" className="flex items-center space-x-2 hover:text-blue-400">
            <Newspaper size={18} />
            <span>Growfly News</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
