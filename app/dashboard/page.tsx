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

const PROMPT_LIMITS = {
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
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token, router])

  useEffect(() => {
    const idFromParam = paramThreadId
    const lastSavedThread = localStorage.getItem('growfly_last_thread_id')
    const id = idFromParam || lastSavedThread

    if (!id) {
      createNewThread()
      return
    }

    setThreadId(id)

    if (!token) return

    fetch(`${API_BASE_URL}/chat/history/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          setMessages(data.messages || [])
          setThreadTitle(data.title || formatTitleFromDate(new Date()))
        } catch {
          console.error('Failed to parse chat history JSON:', text)
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err)
      })
  }, [paramThreadId, token])

  const formatTitleFromDate = (date: Date) => {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'long',
    })} Chat — ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const createNewThread = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Thread creation failed:', text)
        throw new Error('Thread creation failed')
      }

      const data = await res.json()
      const newId = data.threadId
      setThreadId(newId)
      setMessages([])
      const title = formatTitleFromDate(new Date())
      setThreadTitle(title)
      localStorage.setItem('growfly_last_thread_id', newId)
    } catch (err) {
      console.error('Failed to create new thread:', err)
    }
  }

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

  const fetchFollowUps = async (text: string): Promise<string[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Follow-ups fetch failed')
      const data = await res.json()
      const rawFollowUps = (data.followUps as string[]) || []
      const unique = Array.from(new Set(rawFollowUps)).slice(0, 2)
      return unique.length > 0
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
      await fetch(`${API_BASE_URL}/chat/history/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, content }),
      })
    } catch (err) {
      console.error('Failed to POST message to history:', err)
    }
  }

  const handleStream = async (prompt: string, aId: string) => {
    let fullContent = ''
    let followUps: string[] = []

    await streamChat({
      prompt,
      threadId: threadId || undefined,
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
                    chunk.followUps ?? msg.followUps ?? ([] as string[]),
                }
              : msg
          )
        )
      },
      onComplete: async () => {
        if (!followUps.length) {
          followUps = await fetchFollowUps(fullContent)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId ? { ...msg, followUps } : msg
            )
          )
        }
        postMessage('assistant', fullContent)
        setUser({
          ...user,
          promptsUsed: (user?.promptsUsed ?? 0) + 1,
          totalXP: (user?.totalXP ?? 0) + 2.5,
        })
      },
    })
  }

  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && !selectedFile) return

    const uId = `u${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: uId, role: 'user', content: text },
    ])
    setInput('')
    postMessage('user', text)

    const aId = `a${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: aId, role: 'assistant', content: '' },
    ])

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        try {
          const res = await fetch(`${API_BASE_URL}/ai/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageBase64: base64, message: text }),
          })
          const data = await res.json()
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId
                ? { ...msg, content: data.content, imageUrl: base64 }
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
      handleStream(text, aId)
    }
  }

  return (
    <div className="flex flex-col h-full p-4 bg-background text-textPrimary">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${messages.length === 0 ? 'invisible' : ''}`}>
          {threadTitle}
        </h2>
        <div className="flex items-center gap-4">
          <PromptTracker used={promptsUsed} limit={promptLimit} />
          <button
            onClick={createNewThread}
            className="text-xs bg-accent text-white px-3 py-1 rounded-full flex items-center gap-2 hover:brightness-110"
          >
            <FaSyncAlt /> New Chat
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-6 pb-6">
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
                : 'bg-gray-100 text-black self-start'
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
                    className="cursor-pointer hover:text-green-500"
                    onClick={() => setShowFeedbackModal(true)}
                  />
                  <HiThumbDown
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => setShowFeedbackModal(true)}
                  />
                  <FaRegBookmark
                    className="cursor-pointer hover:text-yellow-500"
                    onClick={() => setShowSaveModal(true)}
                  />
                  <FaShareSquare
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => router.push('/collab-zone')}
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
            <p className="text-xs text-muted-foreground mt-1">{selectedFile.name}</p>
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

      <SaveModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={async (title: string) => {
          await fetch(`${API_BASE_URL}/ai/saveResponse`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
          })
          setShowSaveModal(false)
        }}
      />

      <FeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        responseId={threadId || 'unknown'}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <DashboardContent />
    </Suspense>
  )
}
