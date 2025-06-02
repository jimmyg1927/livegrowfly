// File: app/dashboard/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import {
  FaRegBookmark,
  FaShareSquare,
  FaFileDownload,
  FaSyncAlt,
} from 'react-icons/fa'
import PromptTracker from '@/components/PromptTracker'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
import streamChat from '@lib/streamChat'
import { useUserStore } from '@lib/store'
import { API_BASE_URL } from '@lib/constants'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  followUps?: string[]
}

const PROMPT_LIMITS: Record<string, number> = {
  free: 20,
  personal: 400,
  business: 2000,
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramThreadId = searchParams?.get('threadId')

  const { user, setUser } = useUserStore()
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('growfly_jwt') || ''
      : ''
  const promptLimit =
    PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || ''] || 0
  const promptsUsed = user?.promptsUsed ?? 0

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadTitle, setThreadTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State for modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackResponseId, setFeedbackResponseId] = useState<string>('')

  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token, router])

  useEffect(() => {
    const id = paramThreadId || localStorage.getItem('growfly_last_thread_id')
    if (id) {
      setThreadId(id)
      fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setMessages(data.messages || [])
          setThreadTitle(data.title || formatTitleFromDate(new Date()))
        })
        .catch(() => {
          createNewThread()
        })
    } else {
      createNewThread()
    }
  }, [paramThreadId])

  const formatTitleFromDate = (date: Date) => {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'long',
    })} Chat – ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const createNewThread = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Thread creation failed')
      const data = await res.json()
      setThreadId(data.threadId)
      setMessages([])
      setThreadTitle('') // Hide title until set by fetch or default
      const title = formatTitleFromDate(new Date())
      setThreadTitle(title)
      localStorage.setItem('growfly_last_thread_id', data.threadId)
    } catch (err) {
      console.error('Failed to create thread:', err)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const nearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100
    if (nearBottom) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchFollowUps = async (text: string): Promise<string[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Followups fetch failed')
      const data = await res.json()
      // Deduplicate and take first two
      const unique = (Array.from(new Set(data.followUps || [])) as string[]).slice(
        0,
        2
      )
      return unique.length
        ? unique
        : ['Can you explain that further?', 'How can I apply this?']
    } catch {
      return ["What's next?", 'Any examples to help?']
    }
  }

  const postMessage = async (
    role: 'user' | 'assistant',
    content: string
  ) => {
    if (!threadId) return
    try {
      await fetch(`${API_BASE_URL}/api/chatHistory/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, content }),
      })
    } catch (err) {
      console.error('Failed to save message:', err)
    }
  }

  const handleStream = async (prompt: string, aId: string) => {
    let fullContent = ''
    let followUps: string[] = []

    await streamChat({
      prompt,
      token,
      threadId: threadId || undefined,
      onStream: (chunk) => {
        if (!chunk.content) return
        fullContent += chunk.content
        if (chunk.followUps) followUps = chunk.followUps

        setMessages((m) =>
          m.map((msg) =>
            msg.id === aId
              ? {
                  ...msg,
                  content: fullContent,
                  followUps: chunk.followUps ?? msg.followUps ?? [],
                }
              : msg
          )
        )
      },
      onComplete: async () => {
        if (!followUps.length) {
          followUps = await fetchFollowUps(fullContent)
          setMessages((m) =>
            m.map((msg) => (msg.id === aId ? { ...msg, followUps } : msg))
          )
        }
        postMessage('assistant', fullContent)
        setUser({
          ...user,
          promptsUsed: (user?.promptsUsed ?? 0) + 1,
          totalXP: (user?.totalXP ?? 0) + 2.5,
        })
      },
      onImage: (imageUrl) => {
        // Handle streamed image URLs if any
      },
    })
  }

  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && !selectedFile) return

    const uId = `u${Date.now()}`
    setMessages((m) => [...m, { id: uId, role: 'user', content: text }])
    setInput('')
    postMessage('user', text)

    const aId = `a${Date.now()}`
    setMessages((m) => [...m, { id: aId, role: 'assistant', content: '' }])

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        try {
          const res = await fetch(`${API_BASE_URL}/api/ai/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageBase64: base64, message: text }),
          })
          const data = await res.json()
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aId
                ? { ...msg, content: data.content, imageUrl: base64 }
                : msg
            )
          )
          postMessage('assistant', data.content)
        } catch {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aId
                ? { ...msg, content: '❌ Failed to analyze image.' }
                : msg
            )
          )
        }
      }
      reader.readAsDataURL(selectedFile)
      setSelectedFile(null)
    } else {
      handleStream(text, aId)
    }
  }

  return (
    <div className="flex flex-col h-full p-4 bg-background text-textPrimary">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{threadTitle}</h2>
        <div className="flex items-center gap-4">
          {/* Make PromptTracker bar more visible: */}
          <PromptTracker used={promptsUsed} limit={promptLimit} />
          <button
            onClick={() => {
              createNewThread()
              setThreadTitle('')
            }}
            className="text-xs bg-accent text-white px-3 py-1 rounded-full flex items-center gap-2 hover:brightness-110"
          >
            <FaSyncAlt /> New Chat
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-6 pb-6"
      >
        {messages.length === 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => handleSubmit('What can Growfly do for me?')}
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-full text-sm font-medium shadow"
            >
              What can Growfly do for me?
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`whitespace-pre-wrap text-sm p-4 rounded-xl shadow-sm max-w-2xl ${
              msg.role === 'user'
                ? 'bg-accent text-white self-end ml-auto'
                : 'bg-gray-300 text-black self-start'
            }`}
          >
            {msg.imageUrl && (
              <Image
                src={msg.imageUrl}
                alt="Uploaded"
                width={240}
                height={240}
                className="mb-2 rounded shadow"
              />
            )}
            <p>{msg.content}</p>

            {msg.role === 'assistant' && (
              <>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {msg.followUps?.map((fu, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(fu)}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                    >
                      {fu}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-lg">
                  <HiThumbUp
                    onClick={() => {
                      setFeedbackResponseId(msg.id)
                      setIsFeedbackModalOpen(true)
                    }}
                    className="cursor-pointer hover:text-green-500"
                  />
                  <HiThumbDown
                    onClick={() => {
                      setFeedbackResponseId(msg.id)
                      setIsFeedbackModalOpen(true)
                    }}
                    className="cursor-pointer hover:text-red-500"
                  />
                  <FaRegBookmark
                    onClick={() => setIsSaveModalOpen(true)}
                    className="cursor-pointer hover:text-yellow-500"
                  />
                  <FaShareSquare
                    onClick={() => router.push('/collab-zone')}
                    className="cursor-pointer hover:text-blue-500"
                  />
                  {msg.imageUrl && (
                    <FaFileDownload className="cursor-pointer hover:text-gray-600" />
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t pt-4 mt-4">
        <textarea
          rows={2}
          className="w-full p-3 rounded border bg-input text-textPrimary resize-none text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-blue-400 px-4 py-2 rounded text-blue-600 hover:bg-blue-50"
          >
            📎 Upload Image / PDF
          </div>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setSelectedFile(file)
            }}
            className="hidden"
            ref={fileInputRef}
          />
          {selectedFile && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedFile.name}
            </p>
          )}
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() && !selectedFile}
            className="bg-accent hover:bg-accent/90 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-full text-sm shadow transition-all"
          >
            ➤ Send
          </button>
        </div>
      </div>

      {/* SaveModal and FeedbackModal with required props */}
      <SaveModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={async (title: string) => {
          // Implement save logic here if needed
          setIsSaveModalOpen(false)
        }}
      />
      <FeedbackModal
        responseId={feedbackResponseId}
        open={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
