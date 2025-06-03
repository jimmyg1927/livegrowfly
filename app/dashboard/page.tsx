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

// Use environment variable directly instead of importing from constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

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
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  const promptLimit = PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || ''] || 0
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
    const storedThreadId = localStorage.getItem('growfly_last_thread_id')
    const id = paramThreadId || storedThreadId

    if (!id) {
      createNewThread()
      return
    }

    setThreadId(id)

    if (!token || !id) return

    fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          setMessages(data.messages || [])
          setThreadTitle(data.title || formatTitleFromDate(new Date()))
        } catch (err) {
          console.error('Failed to parse chat history JSON:', { error: err, text })
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
      const res = await fetch(`${API_BASE_URL}/api/chat/create`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
    if (nearBottom) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
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
      await fetch(`${API_BASE_URL}/api/chat/history/${threadId}`, {
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
        if (!user) return
        setUser({
          ...user,
          promptsUsed: (user.promptsUsed ?? 0) + 1,
          totalXP: (user.totalXP ?? 0) + 2.5,
        })
      },
    })
  }

  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && !selectedFile) return

    const uId = `u${Date.now()}`
    setMessages((prev) => [...prev, { id: uId, role: 'user', content: text }])
    setInput('')
    postMessage('user', text)

    const aId = `a${Date.now()}`
    setMessages((prev) => [...prev, { id: aId, role: 'assistant', content: '' }])

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
    <div className="flex flex-col h-full p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50 text-textPrimary">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold text-slate-800 ${messages.length === 0 ? 'invisible' : ''}`}>
          {threadTitle}
        </h2>
        <div className="flex items-center gap-4">
          {/* Enhanced Prompt Tracker with Better Visibility */}
          <div className="bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Prompts Used
              </span>
              <div className="flex items-center gap-2">
                <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(promptsUsed / promptLimit) * 100}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
                <span className="text-sm font-bold text-gray-800 min-w-[3rem]">
                  {promptsUsed}/{promptLimit}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={createNewThread}
            className="text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
          >
            <FaSyncAlt className="text-xs" /> New Chat
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.length === 0 && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => handleSubmit('What can Growfly do for me?')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              ✨ What can Growfly do for me?
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-4xl p-5 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                  : 'bg-white border border-gray-100 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm'
              }`}
            >
              {msg.imageUrl && (
                <Image
                  src={msg.imageUrl}
                  alt="Uploaded"
                  width={280}
                  height={280}
                  className="mb-4 rounded-xl shadow-md"
                />
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </p>

              {msg.role === 'assistant' && (
                <>
                  {/* Follow-up Questions */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex gap-3 mt-5 flex-wrap">
                      {msg.followUps.map((fu, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(fu)}
                          className="bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 hover:text-indigo-800 px-4 py-2 rounded-xl text-xs font-medium shadow-sm border border-indigo-200 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          💡 {fu}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-4 text-lg text-gray-500">
                    <HiThumbUp
                      className="cursor-pointer hover:text-green-500 transition-colors duration-200 transform hover:scale-110"
                      onClick={() => setShowFeedbackModal(true)}
                    />
                    <HiThumbDown
                      className="cursor-pointer hover:text-red-500 transition-colors duration-200 transform hover:scale-110"
                      onClick={() => setShowFeedbackModal(true)}
                    />
                    <FaRegBookmark
                      className="cursor-pointer hover:text-yellow-500 transition-colors duration-200 transform hover:scale-110"
                      onClick={() => setShowSaveModal(true)}
                    />
                    <FaShareSquare
                      className="cursor-pointer hover:text-blue-500 transition-colors duration-200 transform hover:scale-110"
                      onClick={() => router.push('/collab-zone')}
                    />
                    {msg.imageUrl && (
                      <FaFileDownload className="cursor-pointer hover:text-gray-700 transition-colors duration-200 transform hover:scale-110" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Section */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-5 mt-4">
        <textarea
          rows={3}
          className="w-full p-4 rounded-xl border border-gray-200 bg-white text-textPrimary resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Ask Growfly anything about your business..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="flex justify-between items-center mt-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 px-5 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
          >
            📎 <span className="text-sm font-medium">Upload Image / PDF</span>
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
            <p className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              📄 {selectedFile.name}
            </p>
          )}
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() && !selectedFile}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none"
          >
            ➤ Send
          </button>
        </div>
      </div>

      {/* Modals */}
      <SaveModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={async (title: string) => {
          await fetch(`${API_BASE_URL}/api/ai/saveResponse`, {
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