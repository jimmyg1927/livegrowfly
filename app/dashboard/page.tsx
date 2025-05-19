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

type Message = {
  role: 'assistant' | 'user'
  content: string
  imageUrl?: string
  fileName?: string
  fileType?: string
  id?: string
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
      })
      .catch(() => router.push('/login'))
  }, [router, setUser, setXp])

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

    const label = languageOptions.find((opt) => opt.code === language)?.label || 'English'
    const basePrompt = `Please reply in ${label}:\n${prompt}`

    setLoading(true)

    const newMessages: Message[] = [
      ...filePreviews.map((f) => ({
        role: 'user' as const,
        content: prompt || 'Uploaded file',
        imageUrl: f.type.startsWith('image') ? f.url : undefined,
        fileName: f.name,
        fileType: f.type,
      })),
      { role: 'user', content: basePrompt },
      { role: 'assistant', content: '' },
    ]

    setMessages((prev) => [...prev, ...newMessages])
    setInput('')
    setFiles([])
    setFilePreviews([])

    try {
      for await (const { type, content, followUps, responseId } of streamChat(basePrompt, token, language)) {
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
            const updated = [...messages, { role: 'assistant' as const, content }]
            followUps.forEach((q) =>
              updated.push({ role: 'assistant' as const, content: `💡 ${q}` })
            )
            setMessages(updated)
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

  return (
    <div className="px-4 md:px-12 pb-10 bg-background text-foreground min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <PromptTracker used={user?.promptsUsed || 0} limit={user?.promptLimit || 0} />
          <select
            className="text-sm border rounded-full px-3 py-1 bg-muted"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value)
              localStorage.setItem('growfly_lang', e.target.value)
            }}
          >
            {languageOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div ref={chatRef} className="bg-card rounded-2xl p-6 shadow-md max-h-[60vh] overflow-y-auto space-y-6 border border-border">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className="space-y-2 max-w-[80%]">
                {m.imageUrl && (
                  <a href={m.imageUrl} download>
                    <img src={m.imageUrl} alt="Uploaded" className="rounded-lg border max-h-40 cursor-pointer" />
                  </a>
                )}
                <div
                  className={`p-4 rounded-2xl text-sm whitespace-pre-wrap shadow ${
                    m.role === 'assistant' ? 'bg-muted text-foreground' : 'bg-blue-500 text-white'
                  }`}
                >
                  {m.content.startsWith('💡') ? (
                    <button
                      onClick={() => {
                        const follow = m.content.replace(/^💡 /, '')
                        setInput(follow)
                        handleSend(follow)
                      }}
                      className="px-3 py-1 rounded-full border text-sm border-border text-muted-foreground bg-background hover:bg-muted transition"
                    >
                      {m.content.replace(/^💡 /, '')}
                    </button>
                  ) : (
                    <span>{m.content}</span>
                  )}
                </div>

                {m.role === 'assistant' && !m.content.startsWith('💡') && i === messages.length - 1 && (
                  <div className="flex gap-3 pt-1 text-lg text-muted-foreground items-center">
                    <button onClick={() => setFeedbackOpen(true)} title="Helpful">👍</button>
                    <button onClick={() => setFeedbackOpen(true)} title="Needs work">👎</button>
                    <button onClick={() => {
                      setSavingContent(m.content)
                      setShowSaveModal(true)
                    }} title="Save">📌</button>
                    <button onClick={async () => {
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
                    }} title="Collab">🧠</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filePreviews.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {filePreviews.map((f, i) => (
              <div key={i} className="w-20 h-20 border rounded overflow-hidden">
                <img src={f.url} alt={f.name} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
          {(user?.promptsUsed || 0) >= (user?.promptLimit || 0) && (
            <div className="text-sm text-red-500 bg-red-100 p-2 rounded-lg border border-red-300 flex justify-between items-center">
              Prompt limit reached — upgrade to continue.
              <button onClick={() => router.push('/change-plan')} className="ml-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                Upgrade
              </button>
            </div>
          )}

          <div className="flex items-start gap-2">
            <textarea
              rows={2}
              disabled={(user?.promptsUsed || 0) >= (user?.promptLimit || 0)}
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
              disabled={loading || (user?.promptsUsed || 0) >= (user?.promptLimit || 0)}
              className="px-4 py-2 bg-[var(--accent)] hover:scale-105 hover:brightness-110 text-white rounded-full text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? <span className="animate-pulse">Processing...</span> : 'Send'}
            </button>
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-muted border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground"
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
