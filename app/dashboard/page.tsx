'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PromptTracker from '../../src/components/PromptTracker'
import GrowflyBot from '../../src/components/GrowflyBot'
import { Gift } from 'lucide-react'
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

  // 1) Auth check
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

  // 2) Plan guard
  useEffect(() => {
    if (user && (!user.subscriptionType || user.subscriptionType === 'none')) {
      router.push('/plans')
    }
  }, [user, router])

  // 3) Send prompt
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
            className="flex items-center space-x-1 bg-accent text-background px-3 py-1 rounded-full text-xs hover:bg-accent/90 transition"
          >
            <Gift size={16} />
            <span>Refer a Friend</span>
          </Link>
        </div>
      </div>

      {/** ─── STARTER PROMPTS ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {STARTER_PROMPTS.map((pill, i) => (
          <button
            key={i}
            onClick={() => handleSend(pill)}
            className="text-xs bg-accent text-background px-3 py-1 rounded-full whitespace-normal hover:bg-accent/90 transition"
          >
            {pill}
          </button>
        ))}
      </div>

      {/** ─── CHAT PANEL ────────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-4 space-y-4 shadow-sm">
        {/** Title Bar */}
        <div className="flex items-center space-x-2">
          <GrowflyBot size={24} />
          <h2 className="text-base font-medium">Ask Growfly</h2>
        </div>

        {/** AI Response Bubble */}
        <div className="bg-muted text-foreground p-4 rounded-xl shadow text-sm leading-relaxed whitespace-pre-wrap border border-border">
          {response}
        </div>

        {/** Live follow-up suggestions */}
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

        {/** Input field */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your prompt here…"
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
