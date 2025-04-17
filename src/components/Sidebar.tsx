'use client';

import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0d1117] text-white p-4">
      <nav className="space-y-4">
        <h2 className="text-lg font-bold">Growfly</h2>
        <ul>
          <li>
            <Link href="/dashboard" className="block hover:text-blue-400">
              🏠 Dashboard
            </Link>
          </li>
          <li>
            <Link href="/plans" className="block hover:text-blue-400">
              💡 Upgrade Plan
            </Link>
          </li>
          <li>
            <Link href="/logout" className="block hover:text-red-400">
              🚪 Logout
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
