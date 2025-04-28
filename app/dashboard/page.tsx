'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';
import PromptTracker from '../../src/components/PromptTracker';
import VoteFeedback from '../../src/components/VoteFeedback';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [responseHistory, setResponseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  const promptSuggestions = [
    'Give me a social media plan for this week',
    'Suggest a TikTok strategy for my brand',
    'Write me a Facebook ad copy for a product launch',
    'Generate a daily content calendar for Instagram',
    'Give me 5 growth hacks for my Shopify store',
  ];

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responseHistory]);

  const handlePromptSubmit = async () => {
    if (!input.trim()) return;

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

      setResponseHistory((prev) => [...prev, { prompt: input, response: data.response }]);
      setInput('');
    } catch (err: any) {
      setResponseHistory((prev) => [...prev, { prompt: input, response: `❌ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handlePrePromptSelect = (prompt: string) => {
    setInput(prompt);
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
            <span className="text-sm bg-black text-white rounded px-3 py-1 mt-2 md:mt-0">
              Plan: {user.subscriptionType} | {user.promptsUsed} / {user.promptLimit}
            </span>
          </div>

          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />

          <section className="bg-black text-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">✨ Need inspiration? Try one of these prompts:</h2>
            <div className="flex flex-wrap gap-3">
              {promptSuggestions.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePrePromptSelect(prompt)}
                  className="bg-[#2daaff] hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-black text-white rounded-2xl shadow p-6">
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

          {/* 🚀 Growfly Chat Section */}
          <section className="bg-white text-black rounded-2xl shadow p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <img src="/growfly-bot.png" alt="Growfly Bot" className="w-10 h-10 mr-3" />
              <h2 className="text-xl font-bold">Growfly</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-96 border p-4 rounded mb-4 bg-gray-100 text-black">
              {responseHistory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="font-semibold text-blue-600">You: {item.prompt}</div>
                  <div className="bg-white text-black p-3 rounded shadow-sm whitespace-pre-wrap">{item.response}</div>
                  <VoteFeedback response={item.response} />
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <textarea
              placeholder="Type your question..."
              className="w-full border rounded px-4 py-2 mb-4 resize-none text-black"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handlePromptSubmit}
              className="bg-[#2daaff] hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Submit Prompt'}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
