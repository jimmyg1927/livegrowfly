'use client';

import ThemeToggle from './ThemeToggle';

export default function Header({ name }: { name: string }) {
  return (
    <header className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 flex justify-between items-center rounded-b-2xl shadow-md">
      <h1 className="text-xl font-bold">🌱 Growfly AI</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm">Logged in as: {name}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
