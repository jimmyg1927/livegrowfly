'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiThumbUp, HiThumbDown } from 'react-icons/hi';
import { API_BASE_URL } from '@/lib/constants';

interface WishlistItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  positiveVotes: number;
  negativeVotes: number;
  userVote: 'none' | 'positive' | 'negative';
}

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subtitle: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: WishlistItem[] = await res.json();
      data.sort((a, b) => b.positiveVotes - a.positiveVotes);
      setItems(data);
    } catch {
      alert('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, body } = form;
    if (!title.trim() || !body.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ title: '', subtitle: '', body: '' });
      fetchItems();
    } catch {
      alert('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (id: string, vote: 'positive' | 'negative') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      });
      if (!res.ok) throw new Error();
      fetchItems();
    } catch {
      alert('Could not register vote.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white space-y-10">
      <h1 className="text-4xl font-bold mb-6">🎯 Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/20 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-2">🚀 Suggest a Feature</h2>

          <input
            name="title"
            placeholder="Feature title (short & punchy)"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#2a2a2a] rounded text-white text-sm"
            required
          />

          <input
            name="subtitle"
            placeholder="Optional subtitle (adds context)"
            value={form.subtitle}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#2a2a2a] rounded text-white text-sm"
          />

          <textarea
            name="body"
            placeholder="Describe your idea in detail..."
            value={form.body}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-[#2a2a2a] rounded text-white text-sm"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {submitting ? 'Posting…' : 'Add to Wishlist'}
          </button>
        </form>

        <div className="bg-white/5 p-4 rounded-xl border border-white/20">
          <h2 className="text-xl font-semibold text-blue-400 mb-1">📝 Why Your Feedback Matters</h2>
          <p className="text-sm text-gray-300">
            This wishlist is powered by you. Your feature suggestions shape the future of Growfly.
            Tell us what would make your workflow smoother, smarter, and more magical.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm">No requests yet. Be the first to add one!</p>
      ) : (
        <ul className="space-y-6">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white/5 p-5 rounded-xl border border-white/10 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              {item.subtitle && (
                <p className="text-xs text-gray-400 mb-1">{item.subtitle}</p>
              )}
              <p className="text-sm text-gray-300 mb-3">{item.body}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(item.id, 'positive')}
                  className={`flex items-center gap-1 px-4 py-1 rounded-full text-sm transition ${
                    item.userVote === 'positive'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600'
                  }`}
                >
                  <HiThumbUp className="w-4 h-4" />
                  {item.positiveVotes}
                </button>
                <button
                  onClick={() => handleVote(item.id, 'negative')}
                  className={`flex items-center gap-1 px-4 py-1 rounded-full text-sm transition ${
                    item.userVote === 'negative'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-red-600'
                  }`}
                >
                  <HiThumbDown className="w-4 h-4" />
                  {item.negativeVotes}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
