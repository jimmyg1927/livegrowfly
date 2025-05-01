'use client';

import React from 'react';
import Sidebar from '../src/components/Sidebar';
import Header from '../src/components/Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name="Growfly User" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
