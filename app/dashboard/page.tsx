// File: app/dashboard/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PromptTracker from '@/components/PromptTracker'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
import { API_BASE_URL, defaultFollowUps } from '@lib/constants'
import { useUserStore } from '@lib/store'
import streamChat from '@lib/streamChat'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark, FaShareSquare } from 'react-icons/fa'

const languageOptions = [
  { code: 'en-UK', label: '🇬🇧 English (UK)' },
  { code: 'en-US', label: '🇺🇸 English (US)' },
  { code: 'da', label: '🇩🇰 Danish' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'nl', label: '🇳🇱 Dutch' },
  { code: 'sv', label: '🇸🇪 Swedish' },
  { code: 'pl', label: '🇵🇱 Polish' },
]

type Message = {
  role: 'assistant' | 'user'
  content: string
  imageUrl?: string
  fileName?: string
  fileType?: string
  id?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<{ url: string; name: string; type: string }[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savingContent, setSavingContent] = useState('')
  const [language, setLanguage] = useState('en-UK')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackId, setFeedbackId] = useState('')

  const chatRef = useRef<HTMLDivElement>(null)

  const setUser = useUserStore((s) => s.setUser)
  const setXp = useUserStore((s) => s.setXp)
  const setSubscriptionType = useUserStore((s) => s.setSubscriptionType)
  const xp = useUserStore((s) => s.xp)
  const user = useUserStore((s) => s.user)

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data)
        setXp(data.totalXP || 0)
        setSubscriptionType(data.subscriptionType || 'Free')
        return fetch(`${API_BASE_URL}/api/chat/history`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      })
      .then((res) => res.json())
      .then((history) => setMessages(history || []))
      .catch(() => router.push('/login'))
  }, [router, setUser, setXp, setSubscriptionType])

  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [messages])

  const handleSend = async (overrideInput?: string) => {
    const token = localStorage.getItem('growfly_jwt')
    const prompt = overrideInput || input
    if (!token || (!prompt && files.length === 0)) return
    if ((user?.promptsUsed || 0) >= (user?.promptLimit || 0)) return

    const newMessages: Message[] = [
      { role: 'user', content: prompt },
      { role: 'assistant', content: '' },
    ]

    setMessages((prev) => [...prev, ...newMessages])
    setInput('')
    setFiles([])
    setFilePreviews([])
    setLoading(true)

    await streamChat(
      prompt,
      token,
      (chunk) => {
        if (chunk.type === 'partial' && chunk.content) {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated.findLast((m) => m.role === 'assistant')
            if (last) last.content += chunk.content
            return updated
          })
        } else if (chunk.type === 'complete') {
          setXp((xp || 0) + 2.5)
          setUser({ ...user, promptsUsed: (user?.promptsUsed || 0) + 1 })
          setFeedbackId(chunk.responseId || '')
        }
      },
      () => setLoading(false)
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <PromptTracker used={user?.promptsUsed || 0} limit={user?.promptLimit || 0} />
          <select
            className="text-sm border rounded-full px-3 py-1 bg-muted"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languageOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div
          ref={chatRef}
          className="bg-card rounded-xl p-4 shadow max-h-[60vh] overflow-y-auto space-y-4 border"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-lg text-sm shadow ${m.role === 'assistant' ? 'bg-muted text-foreground' : 'bg-blue-500 text-white'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {defaultFollowUps.map((text, i) => (
            <button
              key={i}
              onClick={() => setInput(text)}
              className="px-3 py-1 bg-accent text-white rounded-full text-sm whitespace-nowrap"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            rows={2}
            className="flex-1 p-3 text-sm rounded-xl border bg-muted focus:outline-none focus:ring-2"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-full text-sm"
          >
            {loading ? 'Processing…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}