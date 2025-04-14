'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import DashboardClient from './DashboardClient';

type UserProps = {
  name?: string | null;
  email: string;
  promptsUsed: number;
  subscriptionType: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`);
        setUser(data);
      } catch (err) {
        console.error('Error loading user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}
