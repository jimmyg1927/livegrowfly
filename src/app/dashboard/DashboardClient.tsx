'use client';

import React, { useState } from 'react';
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
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [followUps, setFollowUps] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">User not found.</p>
      </div>
    );
  }

  const handlePromptSubmit = async () => {
    if (!input) return;
    setLoading(true);
    setResponse('');
    setFollowUps('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: input }),
        }
      );

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
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name={user.email} />

        <main className="p-6 overflow-y-auto">
          <PromptTracker used={user.promptsUsed} limit={200} />

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Subscription: {user.subscriptionType}</h2>
            <p className="text-gray-600 mb-4">Welcome to your dashboard, {user.email}.</p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ask Growfly AI something..."
                className="w-full border border-gray-300 rounded p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handlePromptSubmit}
                disabled={loading}
              >
                {loading ? 'Thinking...' : 'Submit Prompt'}
              </button>

              {response && (
                <div className="border border-gray-200 rounded p-4 bg-gray-50 space-y-3">
                  <div>
                    <h3 className="font-semibold mb-2">AI Response:</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{response}</pre>
                  </div>

                  {followUps && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1 text-sm">Follow-up suggestions:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
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
