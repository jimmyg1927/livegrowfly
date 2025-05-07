'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PromptTracker from '@/components/PromptTracker';
import SaveModal from '@/components/SaveModal';
import FeedbackModal from '@/components/FeedbackModal';
import { Gift, UserCircle, Save, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { useUserStore } from '@/lib/store';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  id?: string;
}

interface User {
  email: string;
  promptLimit: number;
  promptsUsed: number;
  totalXP?: number;
  subscriptionType?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { setUser, setXp, setSubscriptionType } = useUserStore();
  const [user, setUserLocal] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm Growfly — I’m here to help. How can I assist you today?",
    },
  ]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResponseId, setFeedbackResponseId] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const getNextRefresh = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return next.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Auth + load user
  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt');
    if (!token) return router.push('/login');

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUser(data);
        setUserLocal(data);
        setUsage(data.promptsUsed);
        setXp(data.totalXP || 0);
        setSubscriptionType(data.subscriptionType || 'Free');
      })
      .catch(() => {
        localStorage.removeItem('growfly_jwt');
        router.push('/login');
      });
  }, [router, setUser, setXp, setSubscriptionType]);

  // Redirect if no plan
  useEffect(() => {
    if (user && (!user.subscriptionType || user.subscriptionType === 'none')) {
      router.push('/plans');
    }
  }, [user, router]);

  // Auto scroll
  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // Send prompt
  const handleSend = async (msg: string) => {
    const token = localStorage.getItem('growfly_jwt');
    const text = msg.trim();
    if (!text || !user) return;

    if (usage >= user.promptLimit) {
      const refresh = getNextRefresh();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🚫 You’ve hit your monthly limit. Wait until ${refresh}.`,
        },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('AI request failed.');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let full = '';
      let done = false;

      while (!done) {
        const { value, done: rd } = await reader.read();
        done = rd;
        if (!value) continue;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n')) {
          const c = line.trim();
          if (!c.startsWith('data:')) continue;
          const jsonStr = c.replace(/^data:\s*/, '');
          if (jsonStr === '[DONE]') continue;

          try {
            const p = JSON.parse(jsonStr);
            if (p.type === 'partial') {
              full += p.content;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: full } : m
                )
              );
            }

            if (p.type === 'complete') {
              if (p.followUps) setFollowUps(p.followUps);
              if (p.responseId) {
                setFeedbackResponseId(p.responseId);
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, id: p.responseId } : m
                  )
                );
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      setUsage((u) => u + 1);
      setXp(useUserStore.getState().xp + 2.5);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleSave = () => setShowSaveModal(true);
  const confirmSave = async (title: string) => {
    const token = localStorage.getItem('growfly_jwt');
    await fetch(`${API_BASE_URL}/api/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        content: messages.slice(-1)[0]?.content || '',
        title,
      }),
    });
    setShowSaveModal(false);
  };

  const handleShare = async () => {
    const token = localStorage.getItem('growfly_jwt');
    await fetch(`${API_BASE_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        content: messages.slice(-1)[0]?.content || '',
      }),
    });
    router.push('/collab-zone');
  };

  const openFeedbackModalWith = (id: string) => {
    setFeedbackResponseId(id);
    setShowFeedback(true);
  };
  const closeFeedbackModal = () => setShowFeedback(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-textSecondary">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-8 lg:px-12 pb-10 bg-[#111] min-h-screen">
      <div className="flex items-center space-x-4">
        <PromptTracker used={usage} limit={user.promptLimit} />
        <Link
          href="/refer"
          className="flex items-center gap-2 bg-[#1992ff] text-white px-6 py-[14px] rounded-xl shadow hover:bg-[#007ac1] transition"
        >
          <Gift size={22} />
          <span className="text-sm font-semibold">Refer a Friend</span>
        </Link>
        <Link href="/settings">
          <UserCircle className="text-foreground hover:text-accent transition w-7 h-7" />
        </Link>
      </div>

      <div className="bg-[#1e1e1e] rounded-3xl p-6 space-y-4 shadow-md">
        <div className="flex flex-wrap gap-2">
          {['Give me a 7-day launch plan', 'Audit my Instagram bio', 'Suggest hashtags for my niche'].map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-xs bg-muted border border-border text-foreground px-3 py-1 rounded-full hover:bg-muted/70 transition"
            >
              {p}
            </button>
          ))}
        </div>

        <div
          ref={chatRef}
          className="max-h-[60vh] overflow-y-auto space-y-4 bg-[#151515] p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
        >
          {messages.slice(-10).map((m, i) => (
            <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`p-3 rounded-lg max-w-[80%] break-words ${
                  m.role === 'assistant' ? 'bg-blue-100 text-black' : 'bg-blue-600 text-white'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'assistant' && m.id && (
                <div className="flex space-x-2 items-center ml-2">
                  <button onClick={() => openFeedbackModalWith(m.id)} className="p-1 bg-green-500 rounded-full hover:bg-green-600 transition" title="👍">
                    <ThumbsUp className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => openFeedbackModalWith(m.id)} className="p-1 bg-red-600 rounded-full hover:bg-red-500 transition" title="👎">
                    <ThumbsDown className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {followUps.map((t, i) => (
              <button
                key={i}
                onClick={() => handleSend(t)}
                className="text-xs bg-muted border border-border text-foreground px-3 py-1 rounded-full hover:bg-muted/70 transition"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4">
          <input
            className="flex-1 rounded-lg p-2 bg-background border border-border text-sm"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading}
            className="px-4 py-2 bg-[#1992ff] text-white rounded-lg hover:bg-[#007ac1] transition disabled:opacity-50"
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
          <button onClick={handleSave} title="Save" className="p-2 bg-[#58A6FF] rounded hover:bg-[#3d85d1] transition">
            <Save className="w-5 h-5 text-white" />
          </button>
          <button onClick={handleShare} title="Share" className="p-2 bg-[#58A6FF] rounded hover:bg-[#3d85d1] transition">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <SaveModal open={showSaveModal} onClose={() => setShowSaveModal(false)} onConfirm={confirmSave} />
      <FeedbackModal open={showFeedback} onClose={closeFeedbackModal} onSubmit={() => setShowFeedback(false)} responseId={feedbackResponseId} />
    </div>
  );
}
