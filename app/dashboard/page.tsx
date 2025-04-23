'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';
import PromptTracker from '../../src/components/PromptTracker';
import VoteFeedback from '../../src/components/VoteFeedback';
import PrePromptSuggestions from '../../src/components/PrePromptSuggestions';
import BoostMyResults from '../../src/components/BoostMyResults';
import YourAIJourney from '../../src/components/YourAIJourney';
import GrowflyBot from '../../src/components/GrowflyBot';

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
          headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user.email} />
        <main className="p-6 overflow-y-auto space-y-6">
          <GrowflyBot />
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.name || user.email}</h1>
          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />
          <PrePromptSuggestions onSelect={(prompt) => setInput(prompt)} />
          <section className="bg-card rounded-2xl shadow-smooth p-6">
            <h2 className="text-xl font-semibold mb-4">🤖 Ask Growfly AI</h2>
            <input
              type="text"
              placeholder="e.g. Suggest a TikTok strategy for my clothing brand"
              className="w-full border rounded px-4 py-2 mb-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="bg-accent text-white px-4 py-2 rounded hover:bg-blue-700"
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
          <YourAIJourney />
          <BoostMyResults />
        </main>
      </div>
    </div>
  );
}
