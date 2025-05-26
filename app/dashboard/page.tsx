'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import PromptTracker from '@components/PromptTracker'
import SaveModal from '@components/SaveModal'
import FeedbackModal from '@components/FeedbackModal'

import streamChat, { StreamedChunk } from '@lib/streamChat'
import { useUserStore } from '@lib/store'
import { defaultFollowUps, API_BASE_URL } from '@lib/constants'

import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark, FaShareSquare } from 'react-icons/fa'

type Message = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUserStore()

  // 1️⃣ Get your JWT from localStorage
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('growfly_jwt') || ''
    : ''

  // 2️⃣ Safely read prompt stats from `user`
  const promptLimit = (user as any)?.promptLimit ?? 0
  const promptsUsed = (user as any)?.promptsUsed ?? 0

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveContent, setSaveContent] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackTargetId, setFeedbackTargetId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not logged in (no JWT)
  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token, router])

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a user message & stream the AI reply
  const handleSubmit = async () => {
    const text = input.trim()
    if (!text) return

    // 1) Add the user bubble
    const userId = `u${Date.now()}`
    setMessages((m) => [...m, { id: userId, role: 'user', content: text }])
    setInput('')

    // 2) Prepare an empty assistant bubble
    const replyId = `a${Date.now()}`
    setMessages((m) => [...m, { id: replyId, role: 'assistant', content: '' }])

    // 3) Stream in chunks
    await streamChat(
      text,
      token,
      (chunk: StreamedChunk) => {
        if (!chunk.content) return
        setMessages((m) =>
          m.map((msg) =>
            msg.id === replyId
              ? { ...msg, content: msg.content + chunk.content! }
              : msg
          )
        )
      },
      () => {
        // onDone (optional)
      }
    )

    setSelectedFile(null)
  }

  // Quick follow-ups
  const handleFollowUp = (q: string) => {
    setInput(q)
    handleSubmit()
  }

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }

  // Save & Feedback
  const handleSave = (msg: Message) => {
    setSaveContent(msg.content)
    setShowSaveModal(true)
  }
  const handleFeedback = (msg: Message) => {
    setFeedbackTargetId(msg.id)
    setShowFeedbackModal(true)
  }

  return (
    <div className="min-h-screen flex bg-[#001f3f] text-white">
      <div className="flex-1 flex flex-col p-6">
        {/* Prompt Usage Tracker */}
        <PromptTracker used={promptsUsed} limit={promptLimit} />

        {/* Initial “What can Growfly do for me?” */}
        {messages.length === 0 && (
          <div className="text-center my-6">
            <button
              className="bg-[#0074D9] hover:bg-[#005FA3] px-6 py-2 rounded-full font-medium shadow"
              onClick={() => {
                setInput('What can Growfly do for me?')
                handleSubmit()
              }}
            >
              What can Growfly do for me?
            </button>
            <p className="mt-2 text-sm text-[#CCCCCC]">
              Stuck? Visit <strong>Nerdify Me!</strong> for inspiration.
            </p>
          </div>
        )}

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-2xl p-4 rounded-xl shadow-lg whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#004080] self-end text-right'
                  : 'bg-white text-black self-start'
              }`}
            >
              {msg.content}

              {msg.role === 'assistant' && (
                <>
                  {/* Follow-Ups */}
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {defaultFollowUps.slice(0, 2).map((fu, i) => (
                      <button
                        key={i}
                        className="bg-[#DDDDDD] text-black px-3 py-1 rounded-full text-sm"
                        onClick={() => handleFollowUp(fu)}
                      >
                        {fu}
                      </button>
                    ))}
                  </div>

                  {/* Actions: 👍/👎 / Save / Share */}
                  <div className="mt-2 flex items-center gap-4 text-lg text-[#666666]">
                    <HiThumbUp
                      className="cursor-pointer"
                      onClick={() => handleFeedback(msg)}
                    />
                    <HiThumbDown
                      className="cursor-pointer"
                      onClick={() => handleFeedback(msg)}
                    />
                    <FaRegBookmark
                      className="cursor-pointer"
                      onClick={() => handleSave(msg)}
                    />
                    <FaShareSquare
                      className="cursor-pointer"
                      onClick={() => alert('Shared to Collab Zone')}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input & Upload */}
        <div className="mt-4 border-t border-[#005080] pt-4">
          <textarea
            rows={2}
            className="w-full p-3 rounded-lg resize-none text-black"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />

          <div className="mt-2 flex items-center gap-4">
            <input
              type="file"
              accept="image/*,application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#7FB3FF] underline"
            >
              Upload Image / PDF
            </button>
            {selectedFile && (
              <span className="text-sm text-[#CCCCCC]">
                {selectedFile.name}
              </span>
            )}
          </div>

          <button
            className="mt-4 w-full bg-[#0074D9] hover:bg-[#005FA3] py-2 rounded-lg font-medium"
            onClick={handleSubmit}
          >
            Send
          </button>
        </div>
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
