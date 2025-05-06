'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { API_BASE_URL } from '@/lib/constants'

interface WishlistItem {
  id: string
  title: string
  subtitle?: string
  body: string
  positiveVotes: number
  negativeVotes: number
  userVote: 'none' | 'positive' | 'negative'
}

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', subtitle: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  // Redirect if not logged in
  useEffect(() => {
    if (!token) router.push('/login')
  }, [token, router])

  // Fetch and sort
  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data: WishlistItem[] = await res.json()
      data.sort((a, b) => b.positiveVotes - a.positiveVotes)
      setItems(data)
    } catch {
      alert('Failed to load wishlist.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchItems()
  }, [token])

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  // Submit new item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { title, body } = form
    if (!title.trim() || !body.trim() || !token) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setForm({ title: '', subtitle: '', body: '' })
      fetchItems()
    } catch {
      alert('Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  // Voting
  const handleVote = async (id: string, vote: 'positive' | 'negative') => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      })
      if (!res.ok) throw new Error()
      fetchItems()
    } catch {
      alert('Could not register vote.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">🎯 Wishlist</h1>

      {/* New Suggestion Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/20 shadow-sm"
      >
        <h2 className="text-2xl font-semibold">Suggest a Feature</h2>

        <input
          name="title"
          placeholder="Title (short & punchy)"
          value={form.title}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-[#2a2a2a] rounded text-white focus:outline-none"
          required
        />

        <input
          name="subtitle"
          placeholder="Subheading (optional)"
          value={form.subtitle}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-[#2a2a2a] rounded text-white focus:outline-none"
        />

        <textarea
          name="body"
          placeholder="Describe your request in detail..."
          value={form.body}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 bg-[#2a2a2a] rounded text-white focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {submitting ? 'Posting…' : 'Add to Wishlist'}
        </button>
      </form>

      {/* List of Requests */}
      {loading ? (
        <p className="text-center">Loading…</p>
      ) : items.length === 0 ? (
        <p>No requests yet. Be the first to add one!</p>
      ) : (
        <ul className="space-y-6">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white/5 p-6 rounded-xl border border-white/10 hover:shadow-md transition"
            >
              <h3 className="text-2xl font-semibold">{item.title}</h3>
              {item.subtitle && (
                <p className="text-sm text-gray-400 mb-2">{item.subtitle}</p>
              )}
              <p className="mb-4 text-gray-300">{item.body}</p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(item.id, 'positive')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full transition ${
                    item.userVote === 'positive'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600'
                  }`}
                >
                  <HiThumbUp className="w-5 h-5" />
                  {item.positiveVotes}
                </button>
                <button
                  onClick={() => handleVote(item.id, 'negative')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full transition ${
                    item.userVote === 'negative'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-red-600'
                  }`}
                >
                  <HiThumbDown className="w-5 h-5" />
                  {item.negativeVotes}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
