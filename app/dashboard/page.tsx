'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PromptTracker from '@/components/PromptTracker';
import GrowflyBot from '@/components/GrowflyBot';
import SaveModal from '@/components/SaveModal';
import Header from '@/components/Header';
import FeedbackModal from '@/components/FeedbackModal';
import { Gift, UserCircle, Save, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface Message {
  role: 'assistant' | 'user';
  content: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [xp, setXp] = useState<number>(0);
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

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then((data) => {
        setUser(data);
        setUsage(data.promptsUsed);
        setXp(data.totalXP || 0);
      })
      .catch(() => {
        localStorage.removeItem('growfly_jwt');
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    if (user && (!user.subscriptionType || user.subscriptionType === 'none')) {
      router.push('/plans');
    }
  }, [user, router]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async (msg: string) => {
    const token = localStorage.getItem('growfly_jwt');
    const text = msg.trim();
    if (!text || !user) return;

    if (usage >= user.promptLimit) {
      const refreshDate = getNextRefresh();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🚫 You’ve hit your monthly limit. Upgrade your plan or wait until ${refreshDate}.`,
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

      if (!res.ok) {
        throw new Error('AI request failed.');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            const clean = line.trim();
            if (!clean.startsWith('data:')) continue;

            const jsonStr = clean.replace(/^data:\s*/, '');
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === 'partial') {
                fullText += parsed.content;
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: fullText } : m
                  )
                );
              }
              if (parsed.type === 'complete') {
                if (parsed.followUps) setFollowUps(parsed.followUps);
                if (parsed.responseId) {
                  setFeedbackResponseId(parsed.responseId);
                }
              }
            } catch (err) {
              console.error('Streaming error:', err);
            }
          }
        }
      }

      setUsage((prev) => prev + 1);
      setXp((prev) => prev + 2.5);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ ${err.message}` },
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
      body: JSON.stringify({ content: messages.slice(-1)[0]?.content || '' }),
    });
    router.push('/collab-zone');
  };

  const openFeedbackModal = () => setShowFeedback(true);
  const closeFeedbackModal = () => setShowFeedback(false);

  const handleFeedbackSubmit = () => {
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-textSecondary">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-8 lg:px-12 pb-10 bg-[#111] min-h-screen">
      <Header xp={xp} subscriptionType={user.subscriptionType} />

      <div className="flex items-center space-x-4">
        <PromptTracker used={usage} limit={user.promptLimit} />
        <Link
          href="/refer"
          className="flex items-center gap-2 bg-[#1992ff] text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
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
          className="max-h-[60vh] overflow-y-auto space-y-4 bg-[#151515] text-foreground p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap animate-fade-in"
        >
          {messages.slice(-10).map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] break-words ${
                  m.role === 'assistant' ? 'bg-blue-100 text-black' : 'bg-blue-600 text-white'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {followUps.map((text, i) => (
              <button
                key={i}
                onClick={() => handleSend(text)}
                className="text-xs bg-muted border border-border text-foreground px-3 py-1 rounded-full hover:bg-muted/70 transition"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4">
          <input
            className="flex-1 rounded-lg p-2 bg-background border border-border text-sm"
            placeholder="Type your message..."
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
          <button onClick={handleSave} title="Save Response">
            <Save className="text-foreground hover:text-accent w-5 h-5" />
          </button>
          <button onClick={handleShare} title="Share to Collab Zone">
            <Share2 className="text-foreground hover:text-accent w-5 h-5" />
          </button>
          <button onClick={openFeedbackModal} title="Give Feedback">
            <ThumbsUp className="text-green-500 w-5 h-5" />
            <ThumbsDown className="text-red-500 w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      <SaveModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={confirmSave}
      />

      <FeedbackModal
        open={showFeedback}
        onClose={closeFeedbackModal}
        onSubmit={handleFeedbackSubmit}
        responseId={feedbackResponseId}
      />
    </div>
  );
}
