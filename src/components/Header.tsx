'use client'

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import Link from 'next/link';

function getNerdLevel(xp: number = 0) {
  if (xp < 25) return { title: 'Curious Cat', emoji: '🐱', max: 25 };
  if (xp < 150) return { title: 'Nerdlet', emoji: '🧪', max: 150 };
  if (xp < 500) return { title: 'Prompt Prober', emoji: '🧠', max: 500 };
  if (xp < 850) return { title: 'Nerdboss', emoji: '🧙‍♂️', max: 850 };
  return { title: 'Prompt Commander', emoji: '🚀', max: 1000 };
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const xp = useUserStore((state) => state.xp);
  const subscriptionType = useUserStore((state) => state.subscriptionType);
  const { title, emoji, max } = getNerdLevel(xp);
  const progress = Math.min((xp / max) * 100, 100);

  return (
    <header className="flex items-center justify-between bg-[#1992ff] text-white px-6 py-4" style={{ borderRadius: 0, marginLeft: 0 }}>
      <div className="flex items-center gap-6">
        <div className="text-lg font-semibold">
          {emoji} {title} — {Math.floor(xp)} XP
        </div>
        <div className="w-48 bg-white/30 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/change-plan">
          <span className="bg-white text-[#1992ff] px-3 py-1 rounded-full font-medium text-sm hover:underline">
            Subscription: {subscriptionType.toLowerCase()}
          </span>
        </Link>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
          className="bg-white text-[#1992ff] p-2 rounded"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
