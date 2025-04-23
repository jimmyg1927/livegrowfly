'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ name }: { name: string }) {
  const { theme } = useTheme();

  return (
    <header className="bg-primary text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-lg font-bold">Welcome to Growfly</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm">Logged in as: {name}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
