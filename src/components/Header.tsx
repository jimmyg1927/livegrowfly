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
  const progress = isNaN(xp) ? 0 : Math.min((xp / max) * 100, 100);

  return (
    <div className="flex justify-between items-center bg-[#1992ff] px-6 py-4 rounded-2xl shadow border border-[#157cd4] text-white">
      {!hideUser && (
        <div className="flex flex-col gap-1">
          <div className="text-sm sm:text-base font-semibold">
            🧠 {title} — {Math.floor(xp) || 0} XP
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 sm:h-2.5 max-w-xs">
            <div
              className={`h-2 sm:h-2.5 rounded-full transition-all ${
                progress === 0 ? 'bg-gray-100' : 'bg-white'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <span className="text-xs sm:text-sm text-[#1992ff] bg-white px-3 py-1 rounded-full font-medium">
          Subscription: {subscriptionType}
        </span>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="bg-white text-[#1992ff] p-2 rounded-lg hover:opacity-80 transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}
