'use client';

import React, { useEffect, useState } from 'react';
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
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.warn('No JWT token found in localStorage');
          setUser(null);
          return;
        }

        const res = await fetch('https://glowfly-api-production.up.railway.app/shopify/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading...</div>;
  }

  return <DashboardClient user={user} />;
}
