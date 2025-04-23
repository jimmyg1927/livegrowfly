import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Settings, ThumbsUp, Users, Newspaper } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="bg-primary text-white w-64 p-6 flex flex-col space-y-6 h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Image src="/logo.png" alt="Growfly Logo" width={40} height={40} />
        <h2 className="text-2xl font-bold">Growfly</h2>
      </div>
      <ul className="space-y-4">
        <li>
          <Link href="/dashboard" className="flex items-center space-x-2 hover:text-accent">
            <MessageCircle size={18} />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/feedback" className="flex items-center space-x-2 hover:text-accent">
            <ThumbsUp size={18} />
            <span>Feedback</span>
          </Link>
        </li>
        <li>
          <Link href="/change-plan" className="flex items-center space-x-2 hover:text-accent">
            <Users size={18} />
            <span>Change Plan</span>
          </Link>
        </li>
        <li>
          <Link href="/settings" className="flex items-center space-x-2 hover:text-accent">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </li>
        <li>
          <Link href="/growfly-news" className="flex items-center space-x-2 hover:text-accent">
            <Newspaper size={18} />
            <span>Growfly News</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
