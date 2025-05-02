'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PromptTracker from '../../src/components/PromptTracker'
import GrowflyBot from '../../src/components/GrowflyBot'
import { Gift, UserCircle, Save, Share2 } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

const STARTER_PROMPTS = [
  'Give me 3 new ideas today on how to get new business.',
  'Outline a week-long social media calendar for my brand.',
  'Write an email sequence to nurture leads.',
  'Recommend the best marketing channels for a B2B SaaS.',
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState(
    "Hello, I'm Growfly — I’m here to help. How can I assist you today?"
  )
  const [followUps, setFollowUps] = useState<string[]>(STARTER_PROMPTS)
  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated')
        return r.json()
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
      })
  }, [token, router])

  useEffect(() => {
    if (user && (!user.subscriptionType || user.subscriptionType === 'none')) {
      router.push('/plans')
    }
  }, [user, router])

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg }),
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setResponse(data.response)
      setFollowUps(data.followUps || [])
    } catch (err: any) {
      setResponse(`❌ ${err.message}`)
      setFollowUps([])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const handleSave = async () => {
    await fetch(`${API_BASE_URL}/api/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: response }),
    })
  }

  const handleShare = async () => {
    await fetch(`${API_BASE_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: response }),
    })
    router.push('/collab-zone')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-textSecondary">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-8 lg:px-12 pb-10">
      {/** ─── HEADER ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Welcome, {user.name || user.email}
        </h1>
        <div className="flex items-center space-x-4">
          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />
          <Link
            href="/refer"
            className="flex items-center gap-2 bg-muted border border-border px-4 py-3 rounded-xl shadow-sm hover:bg-muted/70 transition"
          >
            <Gift size={18} className="text-accent" />
            <span className="text-sm font-medium">Refer a Friend</span>
          </Link>
          <Link href="/settings">
            <UserCircle className="text-foreground hover:text-accent transition w-7 h-7" />
          </Link>
        </div>
      </div>

      {/** ─── CHAT PANEL ────────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-4 space-y-4 shadow-sm border border-border">
        <div className="flex items-center space-x-2">
          <GrowflyBot size={24} />
          <h2 className="text-base font-medium text-foreground">Your AI Sidekick</h2>
        </div>

        <div className="bg-muted text-foreground p-4 rounded-xl shadow text-sm leading-relaxed whitespace-pre-wrap border border-border animate-fade-in">
          {response}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/80 transition"
          >
            <Save size={14} /> Save
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition"
          >
            <Share2 size={14} /> Share to Collab Zone
          </button>
        </div>

        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {followUps.map((f, i) => (
              <button
                key={i}
                onClick={() => handleSend(f)}
                className="text-xs bg-primary text-white px-3 py-1 rounded-full hover:bg-primary/80 transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="What would you like help with today?"
            className="flex-1 border border-border rounded px-4 py-2 bg-background text-textPrimary text-sm focus:outline-accent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(input)
              }
            }}
            disabled={loading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading}
            className="bg-accent text-background px-6 py-2 text-sm rounded hover:bg-accent/90 transition"
          >
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
