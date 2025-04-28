'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';
import PromptTracker from '../../src/components/PromptTracker';
import VoteFeedback from '../../src/components/VoteFeedback';
import PrePromptSuggestions from '../../src/components/PrePromptSuggestions';
import Image from 'next/image';
import mascot from '/public/growfly-bot.png'; // ✅ Correct path to the mascot image

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [responseHistory, setResponseHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    const isPlanMissing = !user.subscriptionType || user.subscriptionType === 'none';
    if (isPlanMissing) router.push('/plans');
  }, [user, router]);

  const handlePromptSubmit = async () => {
    if (!input) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setResponseHistory((prev) => [...prev, `You: ${input}\nAI: ${data.response}`]);
      setInput('');
    } catch (err: any) {
      setResponseHistory((prev) => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  const referralLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/signup?ref=${user.referralCode}`;

  return (
    <div className="flex h-screen bg-[#0D1B2A] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user.email} />
        <main className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
            <span className="text-sm bg-[#1B263B] text-white rounded px-3 py-1 mt-2 md:mt-0">
              Plan: {user.subscriptionType}
            </span>
          </div>

          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />
          <PrePromptSuggestions onSelect={(prompt) => setInput(prompt)} />

          <section className="bg-[#1B263B] text-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">🎁 Refer Your Friends!</h2>
            <p className="mb-4">Share this link and get 50 FREE prompts when your friends sign up:</p>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
              <span className="break-all">{referralLink}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  alert('Referral link copied to clipboard!');
                }}
                className="ml-4 bg-blue-600 hover:bg-blue-800 text-white px-4 py-1 rounded"
              >
                Copy Link
              </button>
            </div>
          </section>

          <section className="bg-white text-black rounded-2xl shadow p-6">
            <div className="flex items-center mb-4">
              <Image src={mascot} alt="Growfly Bot" width={60} height={60} className="mr-4" />
              <h2 className="text-xl font-semibold">🤖 Ask Growfly AI</h2>
            </div>

            <div className="overflow-y-auto max-h-64 bg-gray-100 text-gray-800 p-4 rounded mb-4 space-y-4">
              {responseHistory.map((item, idx) => (
                <pre key={idx} className="whitespace-pre-wrap text-sm">{item}</pre>
              ))}
            </div>

            <textarea
              placeholder="Type your question here..."
              className="w-full border rounded px-4 py-2 mb-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button
              className="bg-[#2daaff] text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handlePromptSubmit}
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Submit Prompt'}
            </button>
          </section>

          <section className="bg-black text-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">📢 Growfly News</h2>
            <p>New feature: Share responses with your team!</p>
          </section>
        </main>
      </div>
    </div>
  );
}
