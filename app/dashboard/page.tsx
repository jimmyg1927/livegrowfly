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
      ...filePreviews.map((f) => ({
        role: 'user' as const,
        content: prompt || 'Uploaded file',
        imageUrl: f.type.startsWith('image') ? f.url : undefined,
        fileName: f.name,
        fileType: f.type,
      })),
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

  const handleClearChat = async () => {
    const token = localStorage.getItem('growfly_jwt')
    await fetch(`${API_BASE_URL}/api/chat/clear`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setMessages([])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    selected.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const url = reader.result as string
        setFilePreviews((prev) => [...prev, { url, name: file.name, type: file.type }])
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="px-4 md:px-12 pb-10 bg-background text-foreground min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <PromptTracker used={user?.promptsUsed || 0} limit={user?.promptLimit || 0} />
          <button
            onClick={handleClearChat}
            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition"
          >
            🗑️ Clear Chat
          </button>
        </div>

        {/* Chat area */}
        <div
          ref={chatRef}
          className="bg-muted rounded-2xl p-6 shadow-md max-h-[60vh] overflow-y-auto space-y-6 border border-border"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className="space-y-2 max-w-[80%]">
                <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap shadow ${m.role === 'assistant' ? 'bg-white text-black' : 'bg-[#1992FF] text-white'}`}>
                  <span>{m.content}</span>
                </div>
                {m.role === 'assistant' && i === messages.length - 1 && (
                  <div className="flex gap-3 pt-1 text-sm text-muted-foreground">
                    <button onClick={() => setFeedbackOpen(true)}><HiThumbUp /></button>
                    <button onClick={() => setFeedbackOpen(true)}><HiThumbDown /></button>
                    <button onClick={() => { setSavingContent(m.content); setShowSaveModal(true) }}><FaRegBookmark /> Save</button>
                    <button onClick={async () => {
                      const token = localStorage.getItem('growfly_jwt')
                      const res = await fetch(`${API_BASE_URL}/api/collab/share`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ content: m.content }),
                      })
                      const data = await res.json()
                      router.push(`/collab-zone?doc=${data.docId}`)
                    }}><FaShareSquare /> Collab</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Follow-up pills */}
        <div className="flex gap-2 overflow-x-auto max-w-5xl mx-auto mb-4">
          {defaultFollowUps.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-3 py-1 bg-[#1992FF] text-white rounded-full whitespace-nowrap hover:bg-blue-700 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-start gap-2 mt-4">
          <textarea
            rows={2}
            className="flex-1 p-3 text-sm rounded-xl bg-[var(--input)] border border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            placeholder="Type your message or upload files..."
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
            className="px-4 py-2 bg-[var(--accent)] hover:scale-105 hover:brightness-110 text-white rounded-full text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Processing...</span> : 'Send'}
          </button>
        </div>

        {/* Upload area */}
        <div className="mt-4 border border-dashed border-border bg-muted p-4 rounded-xl text-center text-sm text-muted-foreground">
          Drag and drop files here or{' '}
          <label className="underline cursor-pointer">
            browse
            <input type="file" multiple hidden onChange={handleFileInput} />
          </label>
        </div>
      </div>

      <SaveModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={async (title) => {
          const token = localStorage.getItem('growfly_jwt')
          await fetch(`${API_BASE_URL}/api/saved`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content: savingContent }),
          })
          setShowSaveModal(false)
        }}
      />
      <FeedbackModal responseId={feedbackId} open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
