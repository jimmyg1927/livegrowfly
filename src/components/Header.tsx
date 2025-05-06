'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  name?: string;
  xp?: number;
  subscriptionType?: string;
  hideUser?: boolean;
}

function getNerdLevel(xp: number | undefined) {
  if (!xp || xp < 25) return { title: 'Curious Cat', level: 1, max: 25 };
  if (xp < 150) return { title: 'Nerdlet', level: 2, max: 150 };
  if (xp < 500) return { title: 'Prompt Prober', level: 3, max: 500 };
  if (xp < 850) return { title: 'Nerdboss', level: 4, max: 850 };
  return { title: 'Prompt Commander', level: 5, max: 1000 };
}

export default function Header({
  name,
  xp = 0,
  subscriptionType = 'Free',
  hideUser,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { title, max } = getNerdLevel(xp);
  const progress = Math.min((xp / max) * 100, 100);

  return (
    <div className="flex justify-between items-center bg-[#2a2a2a] px-4 py-3 rounded-xl shadow-sm border border-border mb-6">
      {!hideUser && (
        <div className="flex flex-col gap-1 text-textPrimary">
          <div className="text-sm sm:text-base font-medium">
            🧠 {title} — {Math.floor(xp)} XP
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 sm:h-2.5 max-w-xs">
            <div
              className="bg-blue-500 h-2 sm:h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <span className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full">
          Subscription: {subscriptionType}
        </span>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="bg-white/10 text-white p-2 rounded hover:opacity-80 transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}
