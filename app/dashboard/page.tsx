'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PromptTracker from '@/components/PromptTracker';
import VoteFeedback from '@/components/VoteFeedback';
import PrePromptSuggestions from '@/components/PrePromptSuggestions';
import Image from 'next/image';
import Mascot from '@/assets/growfly-mascot.png';

export default function DashboardPage() {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ user: string; ai: string }[]>([]);
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
        if (res.ok) setUser(data);
        else {
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
    if (!user.subscriptionType || user.subscriptionType === 'none') {
      router.push('/plans');
    }
  }, [user, router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePromptSubmit = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { user: input, ai: '' }];
    setMessages(newMessages);
    setInput('');
    setFollowUps('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { user: last.user, ai: data.response }];
      });

      if (data.followUps) setFollowUps(data.followUps);
    } catch (err: any) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { user: last.user, ai: `❌ ${err.message}` }];
      });
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
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const referralLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/signup?ref=${user.referralCode}`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name={user.email} />

        <main className="relative flex flex-col h-full overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Hey {user.name || user.email}</h1>
            <span className="text-sm bg-blue-600 px-3 py-1 rounded-full">
              Plan: {user.subscriptionType}
            </span>
          </div>

          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />

          <PrePromptSuggestions onSelect={(prompt) => setInput(prompt)} />

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent"
          >
            {messages.map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="bg-blue-700 p-3 rounded-lg max-w-3xl">🧠 You: {m.user}</div>
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-3xl">
                  <pre className="whitespace-pre-wrap text-sm">{m.ai}</pre>
                  {m.ai && <VoteFeedback response={m.ai} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-400 italic">🤖 Growfly is thinking...</div>
            )}
            {followUps && (
              <div className="mt-4 text-sm text-gray-300">
                <strong>Try asking:</strong>
                <ul className="list-disc list-inside">
                  {followUps.split('\n').map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t bg-[#1e293b] p-4">
            <div className="flex gap-4 items-center">
              <textarea
                rows={1}
                placeholder="Ask Growfly anything..."
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-800 rounded text-white"
                onClick={handlePromptSubmit}
                disabled={loading}
              >
                Send
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 opacity-80 pointer-events-none">
            <Image src={Mascot} alt="Growfly Bot" width={100} height={100} />
          </div>
        </main>
      </div>
    </div>
  );
}
