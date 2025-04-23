'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

export default function Header({ name }: { name: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between bg-background text-textPrimary p-4 shadow-smooth">
      <div className="flex items-center space-x-3">
        <Image
          src="/growfly-logo.png"
          alt="Growfly Logo"
          width={140}
          height={40}
          priority
        />
        <span className="text-lg font-bold">Growfly Dashboard</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm">Logged in as: {name}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
