'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PromptTracker from '@/components/PromptTracker'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
import { API_BASE_URL } from '@/lib/constants'
import { useUserStore } from '@/lib/store'
import streamChat from '../../lib/streamChat'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark } from 'react-icons/fa'
import { TbBrain } from 'react-icons/tb'

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
    const langPref = localStorage.getItem('growfly_lang')
    if (langPref) setLanguage(langPref)
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
    if ((user?.promptsUsed || 0) >= (user?.promptLimit || 0)) return

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
      for await (const { type, content, followUps, responseId } of streamChat(prompt, token, language)) {
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
          setFeedbackId(responseId || '')

          if (followUps?.length) {
            setMessages((prev) => {
              const updated = [...prev]
              followUps.forEach((q) => {
                updated.push({ role: 'assistant', content: `💡 ${q}` })
              })
              return updated
            })
          }
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
    dropped.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const url = reader.result as string
        setFilePreviews((prev) => [...prev, { url, name: file.name, type: file.type }])
      }
      reader.readAsDataURL(file)
    })
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

  return (
    <div className="px-4 md:px-12 pb-10 bg-background text-textPrimary min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <PromptTracker used={user?.promptsUsed || 0} limit={user?.promptLimit || 0} />
          <select
            className="text-sm border rounded-full px-3 py-1 bg-muted"
            value={language}
            onChange={(e) => {
              const selected = e.target.value
              setLanguage(selected)
              localStorage.setItem('growfly_lang', selected)
            }}
          >
            {languageOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {user?.promptsUsed >= user?.promptLimit && (
          <div className="p-4 rounded-xl bg-red-100 text-red-700 border border-red-300 text-sm flex justify-between items-center">
            You&apos;ve reached your monthly prompt limit.
            <button
              onClick={() => router.push('/change-plan')}
              className="bg-red-600 text-white px-4 py-1 rounded-full ml-4 hover:brightness-110 transition text-xs"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:scale-105 transition"
            onClick={() => {
              setInput('How can Growfly help me?')
              handleSend('How can Growfly help me?')
            }}
          >
            What can Growfly do?
          </button>
        </div>

        {filePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {filePreviews.map((f, i) => (
              <div key={i} className="w-24">
                <img src={f.url} alt={f.name} className="rounded-md max-h-20 border" />
              </div>
            ))}
          </div>
        )}

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
                  className={`p-4 rounded-2xl text-sm whitespace-pre-wrap shadow ${
                    m.role === 'assistant' ? 'bg-gray-100 text-black' : 'bg-blue-500 text-white'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && i === messages.length - 1 && (
                  <div className="flex gap-2 pt-2 text-gray-500 text-sm">
                    <button onClick={() => setFeedbackOpen(true)} title="This was helpful">
                      <HiThumbUp className="hover:text-green-600" />
                    </button>
                    <button onClick={() => setFeedbackOpen(true)} title="Needs improvement">
                      <HiThumbDown className="hover:text-red-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSavingContent(m.content)
                        setShowSaveModal(true)
                      }}
                      title="Save"
                    >
                      <FaRegBookmark className="hover:text-blue-600" />
                    </button>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('growfly_jwt')
                        await fetch(`${API_BASE_URL}/api/collab/share`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ content: m.content }),
                        })
                        router.push('/collab-zone')
                      }}
                      title="Open in Collab Zone"
                    >
                      <TbBrain className="hover:text-purple-600" />
                    </button>
                  </div>
                )}
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
            disabled={loading || user?.promptsUsed >= user?.promptLimit}
            className="px-4 py-2 bg-[var(--accent)] hover:scale-105 hover:brightness-110 text-white rounded-full text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Processing...</span> : 'Send'}
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-muted border border-dashed border-gray-300 rounded-xl p-4 text-center text-sm text-gray-600"
        >
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
