'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';
import PromptTracker from '../../src/components/PromptTracker';
import VoteFeedback from '../../src/components/VoteFeedback';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // pulls our stored JWT
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('growfly_jwt') 
    : null;

  // fetch current user
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
        else {
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

  // redirect if no plan
  useEffect(() => {
    if (!user) return;
    if (!user.subscriptionType || user.subscriptionType === 'none') {
      router.push('/plans');
    }
  }, [user, router]);

  // handle both manual-send and suggestion-click
  const handlePromptSubmit = async (overrideMessage?: string) => {
    const messageToSend = overrideMessage ?? input;
    if (!messageToSend.trim()) return;
    setLoading(true);
    setResponse('');
    setFollowUps([]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setResponse(data.response);
      setFollowUps(data.followUps || []);
      // clear input only when manually sent
      if (!overrideMessage) setInput('');
    } catch (err: any) {
      setResponse(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // click on a suggestion pill
  const handleSuggestionClick = (suggestion: string) => {
    handlePromptSubmit(suggestion);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#2daaff] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name={user.email} />

        <main className="p-6 overflow-y-auto space-y-6">
          {/* Welcome + Plan */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-white">Welcome, {user.name || user.email}</h1>
            <span className="text-sm bg-black text-white rounded px-3 py-1 mt-2 md:mt-0">
              Plan: {user.subscriptionType}
            </span>
          </div>

          {/* Prompt usage tracker */}
          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />

          {/* AI Chat Section */}
          <section className="bg-white text-black rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🤖 Ask Growfly AI</h2>

            {/* 1) Follow-up / suggestion pills */}
            {followUps.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {followUps.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* 2) Input + send */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your prompt here…"
                className="flex-1 border rounded px-4 py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={() => handlePromptSubmit()}
                disabled={loading}
                className={`px-4 py-2 rounded text-white ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800'
                }`}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>

            {/* 3) AI response + vote */}
            {response && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">📬 AI Response</h3>
                <div className="bg-gray-100 text-gray-800 p-4 rounded">
                  <pre className="whitespace-pre-wrap">{response}</pre>
                </div>
                <VoteFeedback response={response} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
