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
  const [followUps, setFollowUps] = useState('');
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
      } catch (err) {
        localStorage.removeItem('growfly_jwt');
        router.push('/login');
      }
    };
    fetchUser();
  }, [token, router]);

  useEffect(() => {
    if (!user) return;
    const isPlanMissing = !user.subscriptionType || user.subscriptionType === 'none';
    if (isPlanMissing) {
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
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  const referralLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/signup?ref=${user.referralCode}`;

  return (
    <div className="flex h-screen bg-[#2daaff] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user.email} />
        <main className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
            <span className="text-sm bg-black text-white rounded px-3 py-1 mt-2 md:mt-0">
              Plan: {user.subscriptionType}
            </span>
          </div>

          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />

          {/* 🚀 Referral Link Box */}
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

          <section className="bg-white text-black rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">🤖 Ask Growfly AI</h2>
            <input
              type="text"
              placeholder="e.g. Suggest a TikTok strategy for my clothing brand"
              className="w-full border rounded px-4 py-2 mt-2 mb-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="bg-[#2daaff] text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handlePromptSubmit}
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Submit Prompt'}
            </button>

            {response && (
              <div className="mt-6">
                <h3 className="text-lg font-bold">📬 AI Response</h3>
                <div className="bg-gray-100 text-gray-800 p-4 rounded mt-2">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
                <VoteFeedback response={response} />
              </div>
            )}

            {followUps && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold">Try asking:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {followUps.split('\n').map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
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
