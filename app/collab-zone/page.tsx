'use client';

import CollabZone from '../../src/components/CollabZone/CollabZone';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CollabZonePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };
    fetchUser();
  }, [token, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading your collaborative zone...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#2daaff] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user.email} />
        <main className="p-6 overflow-y-auto">
          <CollabZone />
        </main>
      </div>
    </div>
  );
}
