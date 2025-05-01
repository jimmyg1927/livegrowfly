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
    setLoading(true)
    setResponse('')
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
    } finally {
      setLoading(false)
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
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user.name || user.email}
          </h1>
          <p className="text-sm text-textSecondary">Prompts used this month</p>
        </div>

        <div className="flex items-center space-x-4">
          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />
          <Link
            href="/refer"
            className="flex items-center space-x-1 bg-accent text-background px-3 py-1 rounded-full text-sm hover:bg-accent/90 transition"
          >
            <Gift size={16} />
            <span>Refer a Friend</span>
          </Link>
        </div>
      </div>

      {/* Prompt pills */}
      <div className="bg-card rounded-2xl p-4 flex flex-wrap gap-2">
        {followUps.map((pill, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(pill)
              handleSend(pill)
            }}
            className="bg-accent text-background px-4 py-1 rounded-full whitespace-normal hover:bg-accent/90 transition"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Chat box */}
      <div className="bg-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <GrowflyBot size={28} />
          <h2 className="text-xl font-semibold">Ask Growfly AI</h2>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your prompt here…"
            className="flex-1 border border-card rounded px-4 py-2 bg-background text-textPrimary focus:outline-accent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading}
            className="bg-accent text-background px-6 rounded hover:bg-accent/90 transition"
          >
            {loading ? '…' : 'Send'}
          </button>
        </div>
        <div className="space-y-2">
          <h3 className="flex items-center space-x-2 text-lg font-semibold">
            <GrowflyBot size={20} />
            <span>Growfly Response</span>
          </h3>
          <div className="bg-background p-4 rounded text-textPrimary">
            {response}
          </div>
          <div className="flex items-center space-x-4 pt-1">
            <span className="text-textSecondary">Was this helpful?</span>
            <button className="text-accent hover:opacity-80">👍</button>
            <button className="text-card hover:opacity-80">👎</button>
          </div>
        </div>
      </div>
    </div>
  )
}
