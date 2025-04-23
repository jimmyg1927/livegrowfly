'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-full hover:bg-accent/80 transition duration-300 shadow-smooth"
      aria-label="Toggle Light/Dark Mode"
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          <span className="text-sm">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={16} />
          <span className="text-sm">Light Mode</span>
        </>
      )}
    </button>
  );
}
