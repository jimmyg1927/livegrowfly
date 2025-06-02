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
  const [isNewThread, setIsNewThread] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveContent, setSaveContent] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackTargetId, setFeedbackTargetId] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Redirect to onboarding if no token
  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token, router])

  // Load existing thread or create a new one
  useEffect(() => {
    const existingId =
      paramThreadId || localStorage.getItem('growfly_last_thread_id')
    if (existingId) {
      setIsNewThread(false)
      setThreadId(existingId)
      fetch(`${API_BASE_URL}/api/chat/history/${existingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setMessages(data.messages || [])
          setThreadTitle(data.title || formatTitleFromDate(new Date()))
        })
        .catch(() => {
          // If history fetch fails for any reason, open a fresh thread
          createNewThread()
        })
    } else {
      createNewThread()
    }
  }, [paramThreadId])

  // Format default title from current date/time
  const formatTitleFromDate = (date: Date) => {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'long',
    })} Chat – ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  // Create a brand-new thread
  const createNewThread = async () => {
    setIsNewThread(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/chats/chat/create`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) throw new Error('Failed to create thread')
      const data = await res.json()
      setThreadId(data.threadId)
      setMessages([])
      setThreadTitle('') // hide title for new thread
      localStorage.setItem('growfly_last_thread_id', data.threadId)
    } catch (err) {
      console.error('Failed to create thread:', err)
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const nearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100
    if (nearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Attempt to fetch two follow-up suggestions
  const fetchFollowUps = async (text: string): Promise<string[]> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/ai/followups`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text }),
        }
      )
      if (!res.ok) throw new Error('Followups fetch failed')
      const raw = (await res.json()) as { followUps?: unknown[] }

      // Convert unknown[] to string[]
      const arrayOfAny: unknown[] = raw.followUps || []
      const stringArray: string[] = arrayOfAny
        .filter((x) => typeof x === 'string')
        .map((x) => x as string)

      // Deduplicate and take first two
      const unique: string[] = Array.from(new Set(stringArray)).slice(0, 2)
      return unique.length
        ? unique
        : ['Can you explain that further?', 'How can I apply this?']
    } catch {
      return ['What’s next?', 'Any examples to help?']
    }
  }

  // Persist each message to history
  const postMessage = async (
    role: 'user' | 'assistant',
    content: string
  ) => {
    if (!threadId) return
    try {
      await fetch(
        `${API_BASE_URL}/api/chatHistory/${threadId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role, content }),
        }
      )
    } catch (err) {
      console.error('Failed to post message to history:', err)
    }
  }

  // Stream the AI response back to the page
  const handleStream = async (prompt: string, aId: string) => {
    let fullContent = ''
    let followUps: string[] = []

    await streamChat({
      prompt,
      token,
      onStream: (chunk) => {
        if (!chunk.content) return
        fullContent += chunk.content
        if (chunk.followUps) followUps = chunk.followUps

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aId
              ? {
                  ...msg,
                  content: fullContent,
                  followUps:
                    chunk.followUps ?? msg.followUps ?? [],
                }
              : msg
          )
        )
      },
      onComplete: async () => {
        // If no followUps from SSE, fetch manually
        if (!followUps.length) {
          followUps = await fetchFollowUps(fullContent)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId ? { ...msg, followUps } : msg
            )
          )
        }
        postMessage('assistant', fullContent)
        // Increment user’s usage & XP
        setUser({
          ...user,
          promptsUsed: (user?.promptsUsed ?? 0) + 1,
          totalXP: (user?.totalXP ?? 0) + 2.5,
        })
      },
    })
  }

  // Handle sending either a “What can Growfly do...” or a custom user prompt
  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && !selectedFile) return

    // Add user message locally
    const uId = `u${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: uId, role: 'user', content: text },
    ])
    setInput('')
    postMessage('user', text)

    // Add placeholder assistant message
    const aId = `a${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: aId, role: 'assistant', content: '' },
    ])

    // If a file is attached, handle image/PDF logic
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
            body: JSON.stringify({
              imageBase64: base64,
              message: text,
            }),
          })
          const data = await res.json()
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId
                ? {
                    ...msg,
                    content: data.content,
                    imageUrl: base64,
                  }
                : msg
            )
          )
          postMessage('assistant', data.content)
        } catch {
          setMessages((prev) =>
            prev.map((msg) =>
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
      // No file: stream a chat response
      handleStream(text, aId)
    }
  }

  return (
    <div
      className="flex flex-col h-full p-4 bg-background text-textPrimary"
      style={{ overflow: 'hidden' }}
    >
      {/* Top bar: hide title if brand-new thread */}
      <div className="flex justify-between items-center mb-4">
        {!isNewThread && (
          <h2 className="text-xl font-bold">{threadTitle}</h2>
        )}
        <div className="flex items-center gap-4">
          <PromptTracker used={promptsUsed} limit={promptLimit} />
          <button
            onClick={() => {
              createNewThread()
            }}
            className="text-xs bg-accent text-white px-3 py-1 rounded-full flex items-center gap-2 hover:brightness-110"
          >
            <FaSyncAlt /> New Chat
          </button>
        </div>
      </div>

      {/* Chat messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-6 pb-6"
      >
        {messages.length === 0 && (
          // “What can Growfly do for me?” button on first load
          <div className="mb-4 flex justify-end">
            <button
              onClick={() =>
                handleSubmit('What can Growfly do for me?')
              }
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
                : 'bg-gray-200 text-white self-start'
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
                {/* Follow-up buttons */}
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

                {/* Reaction icons */}
                <div className="flex gap-4 mt-3 text-lg">
                  <HiThumbUp className="cursor-pointer hover:text-green-500" />
                  <HiThumbDown className="cursor-pointer hover:text-red-500" />
                  <FaRegBookmark
                    onClick={() => {
                      setSaveContent(msg.content)
                      setShowSaveModal(true)
                    }}
                    className="cursor-pointer hover:text-yellow-500"
                  />
                  <FaShareSquare
                    onClick={() => {
                      setFeedbackTargetId(msg.id)
                      setShowFeedbackModal(true)
                    }}
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

      {/* Input area */}
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

      {/* SaveModal & FeedbackModal – casting props to 'any' to avoid TS errors */}
      {showSaveModal && (
        <SaveModal
          {...({
            content: saveContent,
            onClose: () => setShowSaveModal(false),
          } as any)}
        />
      )}
      {showFeedbackModal && (
        <FeedbackModal
          {...({
            targetId: feedbackTargetId,
            onClose: () => setShowFeedbackModal(false),
          } as any)}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center">Loading dashboard...</div>}
    >
      <DashboardContent />
    </Suspense>
  )
}
