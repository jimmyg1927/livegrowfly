'use client'
export const dynamic = 'force-dynamic'

import React, {
  useEffect,
  useState,
  useRef,
  DragEvent,
  ChangeEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PromptTracker from '@components/PromptTracker'
import SaveModal from '@components/SaveModal'
import FeedbackModal from '@components/FeedbackModal'
import streamChat, { StreamedChunk } from '@lib/streamChat'
import { useUserStore } from '@lib/store'
import { defaultFollowUps, API_BASE_URL } from '@lib/constants'
import {
  HiThumbUp,
  HiThumbDown,
} from 'react-icons/hi'
import {
  FaRegBookmark,
  FaShareSquare,
} from 'react-icons/fa'

type Message = {
  id: string
  role: 'assistant' | 'user'
  content: string
  imageUrl?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUserStore()

  // JWT from localStorage
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('growfly_jwt') || ''
      : ''

  // prompt stats from user object
  const promptLimit = (user as any)?.promptLimit ?? 0
  const promptsUsed = (user as any)?.promptsUsed ?? 0

  // Local state
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveContent, setSaveContent] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackTargetId, setFeedbackTargetId] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ─────────── Load last 5 messages on mount ───────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('growfly_chat')
    if (stored) {
      try {
        const hist = JSON.parse(stored) as Message[]
        setMessages(hist.slice(-5))
      } catch {
        console.warn('Failed to parse chat history.')
      }
    }
  }, [])

  // ─────────── Persist messages whenever they change ───────────────
  useEffect(() => {
    localStorage.setItem('growfly_chat', JSON.stringify(messages))
  }, [messages])

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token, router])

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle file upload (images/PDFs)
  const uploadFile = async (file: File) => {
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url as string
  }

  // Send user message and stream AI reply
  const handleSubmit = async () => {
    const text = input.trim()
    if (!text && !selectedFile) return

    // Add user text bubble
    const uId = `u${Date.now()}`
    setMessages((m) => [...m, { id: uId, role: 'user', content: text }])
    setInput('')

    // If a file is selected, upload and display
    let imageUrl: string | undefined
    if (selectedFile) {
      imageUrl = await uploadFile(selectedFile)
      setSelectedFile(null)
      setMessages((m) => [
        ...m,
        { id: `i${Date.now()}`, role: 'user', content: '', imageUrl },
      ])
    }

    // Prepare assistant bubble
    const aId = `a${Date.now()}`
    setMessages((m) => [...m, { id: aId, role: 'assistant', content: '' }])

    // Stream AI response
    await streamChat(
      text + (imageUrl ? `\n[Image: ${imageUrl}]` : ''),
      token,
      (chunk: StreamedChunk) => {
        if (!chunk.content) return
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aId
              ? { ...msg, content: msg.content + chunk.content! }
              : msg
          )
        )
      },
      () => {
        /* onDone – no extra steps */
      }
    )
  }

  const handleFollowUp = (q: string) => {
    setInput(q)
    handleSubmit()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }

  const handleSave = (msg: Message) => {
    setSaveContent(msg.content)
    setShowSaveModal(true)
  }

  const handleFeedback = (msg: Message) => {
    setFeedbackTargetId(msg.id)
    setShowFeedbackModal(true)
  }

  return (
    <div className="flex flex-col h-full p-4 pb-2 text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <PromptTracker used={promptsUsed} limit={promptLimit} />
      </div>

      {/* Starter Prompt */}
      {messages.length === 0 && (
        <div className="text-center my-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow transition text-sm"
            onClick={() => {
              setInput('What can Growfly do for me?')
              handleSubmit()
            }}
          >
            What can Growfly do for me?
          </button>
          <p className="text-xs text-muted mt-2">
            Not sure where to start? Try the <strong>Nerdify Me!</strong> zone.
          </p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xl whitespace-pre-wrap text-sm p-4 rounded-xl shadow-sm ${
              msg.role === 'user'
                ? 'bg-primary/10 self-end ml-auto'
                : 'bg-muted self-start'
            }`}
          >
            <p>{msg.content}</p>
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="uploaded"
                className="mt-2 max-h-40 rounded"
              />
            )}

            {msg.role === 'assistant' && (
              <>
                {/* Follow-Ups */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {defaultFollowUps.slice(0, 2).map((fu, i) => (
                    <button
                      key={i}
                      className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded-full transition"
                      onClick={() => handleFollowUp(fu)}
                    >
                      {fu}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-2 text-lg text-muted-foreground">
                  <HiThumbUp
                    onClick={() => handleFeedback(msg)}
                    title="Thumbs Up"
                    className="cursor-pointer"
                  />
                  <HiThumbDown
                    onClick={() => handleFeedback(msg)}
                    title="Thumbs Down"
                    className="cursor-pointer"
                  />
                  <FaRegBookmark
                    onClick={() => handleSave(msg)}
                    title="Save Response"
                    className="cursor-pointer"
                  />
                  {/* Fixed: navigates to Collab Zone */}
                  <FaShareSquare
                    onClick={() => router.push('/collab-zone')}
                    title="Share to Collab Zone"
                    className="cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input & Upload */}
      <div className="border-t mt-4 pt-3">
        <textarea
          rows={2}
          className="w-full p-3 rounded-md border bg-background resize-none text-sm"
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

        <div className="flex items-center gap-3 mt-2 text-sm">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 underline"
          >
            Upload Image / PDF
          </button>
          {selectedFile && (
            <span className="text-xs text-muted-foreground">
              {selectedFile.name}
            </span>
          )}
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm mt-3 w-full transition"
          onClick={handleSubmit}
        >
          Send
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onConfirm={async (title) => {
            await fetch(`${API_BASE_URL}/api/saved`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ title, content: saveContent }),
            })
            setShowSaveModal(false)
          }}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          responseId={feedbackTargetId}
          open={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  )
}
