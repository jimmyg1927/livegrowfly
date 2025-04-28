'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          if (data.email !== 'jimmy@growfly.io') {
            // ✅ Your admin email
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    };

    fetchUser();
  }, [token, router]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setFeedback(data);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFeedback();
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p className="text-lg">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-10 text-white bg-[#1a1a1a] min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Feedback Dashboard</h1>
      {feedback.length === 0 ? (
        <p>No feedback yet.</p>
      ) : (
        <ul className="space-y-4">
          {feedback.map((item) => (
            <li key={item.id} className="bg-gray-800 p-4 rounded shadow">
              <p className="text-lg mb-2">{item.response}</p>
              <p className="text-sm text-gray-400">
                Votes: 👍 {item.upvotes} / 👎 {item.downvotes}
              </p>
              <p className="text-xs text-gray-500">
                Submitted on: {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
