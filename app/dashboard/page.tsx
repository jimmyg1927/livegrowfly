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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Welcome to Growfly! Ask me anything or upload an image or PDF and I’ll help you break it down.",
    },
  ])
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
    if (!chatRef.current) return
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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

  const handleSend = async () => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token || (!input && files.length === 0)) return
    setLoading(true)

    const base64Files = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })
    )

    const res = await fetch(`${API_BASE_URL}/api/ocr/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: input || 'Please analyse these files.', files: base64Files }),
    })

    const { jobId } = await res.json()
    const poll = setInterval(async () => {
      const result = await fetch(`${API_BASE_URL}/api/ocr/status/${jobId}`)
      const { state, result: data } = await result.json()
      if (state === 'completed') {
        clearInterval(poll)
        const responseText = data.content || 'No response.'

        setMessages((prev) => [
          ...prev,
          ...filePreviews.map((f) => ({
            role: 'user' as const,
            content: input || 'Uploaded file',
            imageUrl: f.type.startsWith('image') ? f.url : undefined,
            fileName: f.name,
            fileType: f.type,
          })),
          { role: 'assistant' as const, content: responseText },
        ])
        setXp((xp || 0) + 2.5)
        setUser({ ...user, promptsUsed: (user?.promptsUsed || 0) + 1 })
        setInput('')
        setFiles([])
        setFilePreviews([])
        setLoading(false)
      }
    }, 3000)
  }

  return (
    <div className="px-4 md:px-12 pb-10 bg-background text-textPrimary min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <PromptTracker used={user?.promptsUsed || 0} limit={user?.promptLimit || 0} />

        <div className="text-right">
          <button
            className="text-xs text-blue-500 underline mb-2"
            onClick={() => setInput("What can Growfly do?")}
          >
            What can Growfly do?
          </button>
        </div>

        <div ref={chatRef} className="bg-card rounded-2xl p-6 shadow-md max-h-[60vh] overflow-y-auto space-y-4 border border-border">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className="space-y-1 max-w-[80%]">
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="Uploaded" className="rounded-lg border max-h-40" />
                )}
                <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap shadow ${
                  m.role === 'assistant' ? 'bg-gray-100 text-black' : 'bg-blue-500 text-white'
                }`}>
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
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-[var(--accent)] hover:brightness-110 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Send'}
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

      <SaveModal open={showSaveModal} onClose={() => setShowSaveModal(false)} onConfirm={async (title) => {
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
      }} />

      <FeedbackModal
        open={false}
        onClose={() => {}}
        onSubmit={() => {}}
        responseId=""
      />
    </div>
  )
}
