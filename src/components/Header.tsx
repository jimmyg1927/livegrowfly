'use client';

import React from 'react';

export default function Header({ name }: { name: string }) {
  return (
    <header className="bg-[#161b22] text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Growfly AI</h1>
      <span className="text-sm">Logged in as: {name}</span>
    </header>
  );
}
