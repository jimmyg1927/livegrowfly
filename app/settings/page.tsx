// app/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';

interface UserProfile {
  name?: string;
  email: string;
  linkedIn?: string;
  jobTitle?: string;
  industry?: string;
  narrative?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    name: '',
    linkedIn: '',
    jobTitle: '',
    industry: '',
    narrative: '',
  });
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('growfly_jwt')
    : null;

  // Fetch current user
  useEffect(() => {
    if (!token) return router.push('/login');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setUser(data);
          setForm({
            name: data.name || '',
            linkedIn: (data as any).linkedIn || '',
            jobTitle: (data as any).jobTitle || '',
            industry: (data as any).industry || '',
            narrative: (data as any).narrative || '',
          });
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('Profile updated!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header name={user.email} />
        <main className="p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Your Settings</h1>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <label className="block mb-1 font-semibold">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-card bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">LinkedIn URL</label>
              <input
                name="linkedIn"
                type="url"
                value={form.linkedIn}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-card bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Job Title</label>
              <input
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-card bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Industry</label>
              <input
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-card bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">About You</label>
              <textarea
                name="narrative"
                rows={4}
                value={form.narrative}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-card bg-background"
              />
            </div>
            <button
              type="submit"
              className="bg-accent text-white px-6 py-2 rounded hover:bg-accent/90"
            >
              Save Changes
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
