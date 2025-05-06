'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PromptTracker from '../../src/components/PromptTracker'
import GrowflyBot from '../../src/components/GrowflyBot'
import { Gift, UserCircle, Save, Share2, Loader } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

interface User {
  name?: string
  email: string
  promptLimit: number
  promptsUsed: number
  subscriptionType?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello, I'm Growfly — I’m here to help. How can I assist you today?" }
  ])
  const [followUps, setFollowUps] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState<number>(0)
  const chatRef = useRef<HTMLDivElement>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const getNextRefresh = () => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return next.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated')
        return r.json()
      })
      .then((data) => {
        setUser(data)
        setUsage(data.promptsUsed)
      })
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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  const handleSend = async (msg: string) => {
    const text = msg.trim()
    if (!text) return

    if (usage >= (user?.promptLimit || 0)) {
      const refreshDate = getNextRefresh()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🛛 You’ve hit your monthly limit. Upgrade your plan to unlock more prompts, or wait until ${refreshDate}.`,
        },
      ])
      setInput('')
      return
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text })
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (let line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.replace('data:', '').trim()
            if (jsonStr === '[DONE]') continue

            const data = JSON.parse(jsonStr)
            if (data.type === 'partial') {
              fullText += data.content
              setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullText } : m))
            }
            if (data.type === 'complete' && data.followUps) {
              setFollowUps(data.followUps)
            }
          }
        }
      }

      setUsage((prev) => prev + 1)
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${err.message}` }])
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
      credentials: 'include',
      body: JSON.stringify({ content: messages.slice(-1)[0]?.content || '' }),
    })
  }

  const handleShare = async () => {
    await fetch(`${API_BASE_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ content: messages.slice(-1)[0]?.content || '' }),
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Welcome, {user.name || user.email}
        </h1>
        <div className="flex items-center space-x-4">
          <PromptTracker used={usage} limit={user.promptLimit} />
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

      <div className="bg-card rounded-2xl p-4 space-y-4 shadow-sm border border-border">
        <div className="flex items-center space-x-2">
          <GrowflyBot size={24} />
          <h2 className="text-base font-medium text-foreground">Your AI Sidekick</h2>
        </div>

        <div
          ref={chatRef}
          className="max-h-[60vh] overflow-y-auto space-y-4 bg-muted text-foreground p-4 rounded-xl shadow text-sm leading-relaxed whitespace-pre-wrap animate-fade-in"
        >
          {messages.slice(-10).map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  m.role === 'assistant'
                    ? 'bg-muted border border-border'
                    : 'bg-primary text-white'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
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
                className="text-xs bg-secondary/10 text-secondary border border-secondary px-3 py-1 rounded-full hover:bg-secondary/20 transition"
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div className="flex space-x-2 items-center bg-muted-light p-2 rounded-lg">
          <input
            type="text"
            placeholder="What would you like help with today?"
            className="flex-1 border border-border rounded px-4 py-2 bg-muted text-textPrimary text-sm focus:outline-accent"
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
            className="flex items-center justify-center bg-accent text-background px-4 py-2 text-sm rounded hover:bg-accent/90 transition w-16"
          >
            {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}