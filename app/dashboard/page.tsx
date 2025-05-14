'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PromptTracker from '@/components/PromptTracker'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
import {
  Gift,
  UserCircle,
  Save,
  Share2,
  ThumbsUp,
  ThumbsDown,
  BarChart2,
  Users,
  FileText,
  Briefcase,
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'
import { useUserStore } from '@/lib/store'

interface Message {
  role: 'assistant' | 'user'
  content: string
  id?: string
}

const promptOptions = [
  { text: 'How can Growfly help me?', icon: <Briefcase size={14} /> },
  { text: 'How can you help me with my finances?', icon: <BarChart2 size={14} /> },
  { text: 'How can you help me get more customers?', icon: <Users size={14} /> },
  { text: 'How can you help me with documents and HR?', icon: <FileText size={14} /> },
  { text: 'What marketing should I do today?', icon: <Briefcase size={14} /> },
]

export default function DashboardPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm Growfly — I’m here to help your organisation grow. How can I assist you today?",
    },
  ])
  const [followUps, setFollowUps] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackResponseId, setFeedbackResponseId] = useState('')
  const [savingContent, setSavingContent] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  const setUser = useUserStore((state) => state.setUser)
  const setXp = useUserStore((state) => state.setXp)
  const setSubscriptionType = useUserStore((state) => state.setSubscriptionType)
  const subscriptionType = useUserStore((state) => state.subscriptionType)
  const xp = useUserStore((state) => state.xp)
  const user = useUserStore((state) => state.user)

  const getNextRefresh = () => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return next.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setUser({
          email: data.email,
          name: data.name,
          promptLimit: data.promptLimit,
          promptsUsed: data.promptsUsed,
        })
        setXp(data.totalXP || 0)
        setSubscriptionType(data.subscriptionType || 'Free')
      })
      .catch(() => {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
      })
  }, [router, setUser, setXp, setSubscriptionType])

  useEffect(() => {
    if (user && (!subscriptionType || subscriptionType === 'none')) {
      router.push('/plans')
    }
  }, [user, subscriptionType, router])

  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleSend = async (msg: string) => {
    const token = localStorage.getItem('growfly_jwt')
    const text = msg.trim()
    if (!text || !user) return

    if (user.promptsUsed >= user.promptLimit) {
      const refresh = getNextRefresh()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🚫 You’ve hit your monthly limit. Wait until ${refresh}.`,
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
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('AI request failed.')
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let full = ''
      let done = false

      while (!done) {
        const { value, done: rd } = await reader.read()
        done = rd
        if (!value) continue
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          const c = line.trim()
          if (!c.startsWith('data:')) continue
          const jsonStr = c.replace(/^data:\s*/, '')
          if (jsonStr === '[DONE]') continue
          try {
            const p = JSON.parse(jsonStr)
            if (p.type === 'partial') {
              full += p.content
              setMessages((prev) =>
                prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: full } : m))
              )
            }
            if (p.type === 'complete') {
              if (p.followUps) setFollowUps(p.followUps)
              if (p.responseId) {
                setFeedbackResponseId(p.responseId)
                setMessages((prev) =>
                  prev.map((m, i) => (i === prev.length - 1 ? { ...m, id: p.responseId } : m))
                )
              }
            }
          } catch (e) {
            console.error(e)
          }
        }
      }

      setXp(xp + 2.5)
      setUser({ ...user, promptsUsed: user.promptsUsed + 1 })
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${err.message}` }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const handleSave = (content: string) => {
    setSavingContent(content)
    setShowSaveModal(true)
  }

  const confirmSave = async (title: string) => {
    const token = localStorage.getItem('growfly_jwt')
    await fetch(`${API_BASE_URL}/api/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ content: savingContent, title }),
    })
    setShowSaveModal(false)
  }

  const handleShare = async (content: string) => {
    const token = localStorage.getItem('growfly_jwt')
    await fetch(`${API_BASE_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ content }),
    })
    router.push('/collab-zone')
  }

  const openFeedbackModalWith = (id: string) => {
    setFeedbackResponseId(id)
    setShowFeedback(true)
  }

  const closeFeedbackModal = () => setShowFeedback(false)

  return (
    <div className="px-4 md:px-8 pb-10 bg-background text-textPrimary min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-6">
          <PromptTracker used={user.promptsUsed} limit={user.promptLimit} />
          <Link
            href="/refer"
            className="flex items-center gap-2 bg-[var(--accent)] hover:brightness-110 text-white px-4 py-2 rounded-full shadow-md text-sm font-semibold transition"
          >
            <Gift size={18} />
            Refer a Friend
          </Link>
          <Link href="/settings" className="ml-auto">
            <UserCircle className="text-textPrimary hover:text-accent transition w-6 h-6" />
          </Link>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow space-y-5">
          <div className="flex flex-wrap gap-2">
            {promptOptions.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="flex items-center gap-1 text-xs px-4 py-2 rounded-full bg-[var(--accent)] text-white hover:brightness-110 transition"
              >
                {p.icon}
                {p.text}
              </button>
            ))}
          </div>

          <div ref={chatRef} className="max-h-[60vh] overflow-y-auto space-y-4">
            {messages.slice(-10).map((m, i) => (
              <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className="space-y-1 max-w-[80%]">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow ${
                      m.role === 'assistant'
                        ? 'bg-[var(--highlight)] text-[var(--textPrimary)]'
                        : 'bg-[var(--accent)] text-white'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === 'assistant' && m.id && (
                    <div className="flex gap-2 items-center ml-1">
                      <button onClick={() => openFeedbackModalWith(m.id!)} className="p-1 bg-green-500 rounded-full hover:bg-green-600 transition" title="Thumbs up">
                        <ThumbsUp className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={() => openFeedbackModalWith(m.id!)} className="p-1 bg-red-600 rounded-full hover:bg-red-500 transition" title="Thumbs down">
                        <ThumbsDown className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={() => handleSave(m.content)} title="Save this response" className="p-1 bg-blue-500 rounded-full hover:bg-blue-600 transition">
                        <Save className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={() => handleShare(m.content)} title="Share to Collab Zone" className="p-1 bg-purple-500 rounded-full hover:bg-purple-600 transition">
                        <Share2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {followUps.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {followUps.map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(t)}
                  className="text-xs px-3 py-2 rounded-full border border-border bg-input text-textPrimary hover:bg-accent/10 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-4">
            <input
              className="flex-1 p-2 text-sm rounded-full bg-[var(--input)] border border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(input)
                }
              }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading}
              className="px-4 py-2 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <SaveModal open={showSaveModal} onClose={() => setShowSaveModal(false)} onConfirm={confirmSave} />
      <FeedbackModal open={showFeedback} onClose={closeFeedbackModal} onSubmit={closeFeedbackModal} responseId={feedbackResponseId} />
    </div>
  )
}
