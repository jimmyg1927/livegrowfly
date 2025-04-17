'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PromptTracker from '@/components/PromptTracker';

type UserProps = {
  name?: string | null;
  email: string;
  promptsUsed: number;
  subscriptionType: string;
};

export default function DashboardClient({ user }: { user: UserProps | null }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [followUps, setFollowUps] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!user) return;
    const isPlanMissing = !user.subscriptionType || user.subscriptionType === 'none';
    if (isPlanMissing) {
      router.push('/plans');
    }
  }, [user, router]);

  if (!user || !user.subscriptionType || user.subscriptionType === 'none') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2daaff] text-white">
        <p className="text-lg">Redirecting to select your plan...</p>
      </div>
    );
  }

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

  return (
    <div className="flex h-screen bg-[#2daaff] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name={user.email} />

        <main className="p-6 overflow-y-auto">
          <PromptTracker used={user.promptsUsed} limit={200} />

          <div className="mt-6">
            <h2 className="text-xl font-bold">Welcome, {user.email}</h2>
            <p className="text-sm mb-4 text-white/80">Your plan: <strong>{user.subscriptionType}</strong></p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ask Growfly AI something..."
                className="w-full p-3 rounded bg-white text-black placeholder:text-gray-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="bg-black text-white px-6 py-2 rounded hover:opacity-90 transition"
                onClick={handlePromptSubmit}
                disabled={loading}
              >
                {loading ? 'Thinking...' : 'Submit Prompt'}
              </button>

              {response && (
                <div className="border border-white/30 rounded p-4 bg-white/10 mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-white">AI Response:</h3>
                    <pre className="whitespace-pre-wrap text-white/90">{response}</pre>
                  </div>

                  {followUps && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1 text-sm text-white">Follow-up suggestions:</h4>
                      <ul className="list-disc pl-5 text-sm text-white/80">
                        {followUps.split('\n').map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
