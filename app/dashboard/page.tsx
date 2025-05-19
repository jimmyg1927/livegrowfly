// FILE: app/dashboard/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PromptTracker from '@/components/PromptTracker'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
import { API_BASE_URL } from '@/lib/constants'
import { useUserStore } from '@/lib/store'
import { FileText } from 'lucide-react'
import streamChat from '../../lib/streamChat'


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
  const chatRef = useRef<HTMLDivElement>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savingContent, setSavingContent] = useState('')

  const setUser = useUserStore((s) => s.setUser)
  const setXp = useUserStore((s) => s.setXp)
  const setSubscriptionType = useUserStore((s) => s.setSubscriptionType)
  const subscriptionType = useUserStore((s) => s.subscriptionType)
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
      })
      .catch(() => router.push('/login'))
  }, [router, setUser, setXp, setSubscriptionType])

  useEffect(() => {
    const saved = localStorage.getItem('growfly_chat')
    if (saved) setMessages(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const trimmed = messages.slice(-4)
    localStorage.setItem('growfly_chat', JSON.stringify(trimmed))
  }, [messages])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async (overrideInput?: string) => {
    const token = localStorage.getItem('growfly_jwt')
    const prompt = overrideInput || input
    if (!token || (!prompt && files.length === 0)) return

    setLoading(true)

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

    try {
      for await (const { type, content, followUps } of streamChat(prompt, token)) {
        if (type === 'partial') {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated.findLast((m) => m.role === 'assistant')
            if (last) last.content += content
            return [...updated]
          })
        } else if (type === 'complete') {
          setXp((xp || 0) + 2.5)
          setUser({ ...user, promptsUsed: (user?.promptsUsed || 0) + 1 })

          setMessages((prev) => {
            const updated = [...prev]
            const last = updated.findLast((m) => m.role === 'assistant')
            if (last) {
              last.content += `\n\n`
              followUps?.forEach((q) => {
                last.content += `➡️ ${q}\n`
              })
            }
            return updated
          })
        }
      }
    } catch (err) {
      console.error('Streaming failed', err)
    }

    setLoading(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files || [])
    if (dropped.length > 0) {
      setFiles((prev) => [...prev, ...dropped])
      dropped.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const url = reader.result as string
          setFilePreviews((prev) => [...prev, { url, name: file.name, type: file.type }])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected])
      selected.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const url = reader.result as string
          setFilePreviews((prev) => [...prev, { url, name: file.name, type: file.type }])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return (
    <div className="px-4 md:px-12 pb-10 bg-background text-textPrimary min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <PromptTracker used={user?.promptsUsed || 0} limit={user?.promptLimit || 0} />

       <div className="flex justify-end">
  <button
    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition mb-2"
            onClick={() => {
              setInput('How can Growfly help me?')
              handleSend('How can Growfly help me?')
            }}
          >
            What can Growfly do?
          </button>
        </div>

        <div
          ref={chatRef}
          className="bg-card rounded-2xl p-6 shadow-md max-h-[60vh] overflow-y-auto space-y-4 border border-border"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className="space-y-1 max-w-[80%]">
                {m.imageUrl && (
                  <a href={m.imageUrl} download>
                    <img src={m.imageUrl} alt="Uploaded" className="rounded-lg border max-h-40 cursor-pointer" />
                  </a>
                )}
                <div
                  className={`p-4 rounded-xl text-sm whitespace-pre-wrap shadow ${
                    m.role === 'assistant' ? 'bg-gray-100 text-black' : 'bg-blue-500 text-white'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </div>
          ))}
        </div>

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
            className="px-4 py-2 bg-[var(--accent)] hover:brightness-110 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Processing...</span> : 'Send'}
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center text-sm text-gray-600"
        >
          Drag and drop files here or{' '}
          <label className="underline cursor-pointer">
            browse
            <input type="file" multiple hidden onChange={handleFileInput} />
          </label>
        </div>

        {filePreviews.map((f, i) => (
          <div key={i} className="mt-2">
            {f.type.includes('image') ? (
              <img src={f.url} alt={f.name} className="rounded-lg max-h-48" />
            ) : (
              <div className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
                <FileText size={16} />
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {f.name}
                </a>
              </div>
            )}
          </div>
        ))}
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

      <FeedbackModal open={false} onClose={() => {}} onSubmit={() => {}} responseId="" />
    </div>
  )
}
// fake deploy trigger
