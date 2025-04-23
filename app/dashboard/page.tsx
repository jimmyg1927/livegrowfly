'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PromptTracker from '@/components/PromptTracker';
import VoteFeedback from '@/components/VoteFeedback';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [followUps, setFollowUps] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  const preMadePrompts = [
    '📅 Help me plan my week',
    '📈 Give me a growth strategy',
    '🤖 Write a LinkedIn post for my brand',
    '🎯 Suggest a TikTok idea for my business',
    '💡 Recommend marketing channels for me',
  ];

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
        } else {
          localStorage.removeItem('growfly_jwt');
          router.push('/login');
        }
      } catch {
        localStorage.removeItem('growfly_jwt');
        router.push('/login');
      }
    };
    fetchUser();
  }, [token, router]);

  useEffect(() => {
    if (!user) return;
    if (!user.subscriptionType || user.subscriptionType === 'none') {
      router.push('/plans');
    }
  }, [user, router]);

  const handlePromptSubmit = async () => {
    if (!input) return;
    setLoading(true);
    setResponse('');
    setFollowUps('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setResponse(data.response);
      if (data.followUps) setFollowUps(data.followUps);
    } catch (err: any) {
      setResponse(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-white">
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user.email} />
        <main className="p-6 overflow-y-auto relative">
          {/* 🧠 Pre-made Prompts */}
          <div className="mb-4 flex flex-wrap gap-2">
            {preMadePrompts.map((prompt, i) => (
              <button
                key={i}
                className="bg-card text-sm text-white px-3 py-1 rounded-xl hover:bg-accent transition"
                onClick={() => {
                  setInput(prompt.replace(/^.*?\s/, '')); // Trim emoji if present
                  handlePromptSubmit();
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* 🤖 AI Box + Bot */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold mb-1">Welcome, {user.name || user.email}</h1>
              <span className="text-sm bg-accent text-black px-2 py-1 rounded">Plan: {user.subscriptionType}</span>

              <div className="mt-4 w-full max-w-xl">
                <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />
                <p className="text-xs mt-1">Prompts used this month</p>

                <input
                  type="text"
                  placeholder="e.g. Suggest a TikTok strategy for my clothing brand"
                  className="w-full bg-white text-black rounded-xl px-4 py-3 mt-4"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  className="w-full mt-3 bg-accent text-black font-bold py-2 rounded-xl hover:bg-sky-400 transition"
                  onClick={handlePromptSubmit}
                  disabled={loading}
                >
                  {loading ? 'Thinking...' : 'Submit'}
                </button>
              </div>

              {response && (
                <div className="mt-6 max-w-2xl">
                  <h3 className="text-lg font-bold mb-1">📬 AI Response</h3>
                  <div className="bg-card text-white p-4 rounded-xl">
                    <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                  </div>
                  <VoteFeedback response={response} />
                </div>
              )}

              {followUps && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Suggested Follow Ups:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                    {followUps.split('\n').map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 🤖 Growfly Bot */}
            <div className="hidden lg:block w-[250px] relative">
              <Image
                src="/growfly-bot.png"
                alt="Growfly Bot"
                width={250}
                height={250}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
