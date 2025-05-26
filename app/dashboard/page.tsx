'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark, FaShareSquare } from 'react-icons/fa'
import PromptTracker from '@components/PromptTracker'
import SaveModal from '@components/SaveModal'
import FeedbackModal from '@components/FeedbackModal'
import streamChat, { StreamedChunk } from '@lib/streamChat'
import { useUserStore } from '@lib/store'
import { defaultFollowUps, API_BASE_URL } from '@lib/constants'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''
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

  useEffect(() => {
    localStorage.setItem('growfly_chat', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const handleSubmit = async () => {
    const text = input.trim()
    if (!text && !selectedFile) return

    const uId = `u${Date.now()}`
    setMessages((m) => [...m, { id: uId, role: 'user', content: text }])
    setInput('')

    let imageUrl: string | undefined
    if (selectedFile) {
      imageUrl = await uploadFile(selectedFile)
      setMessages((m) => [...m, { id: `f${Date.now()}`, role: 'user', content: '', imageUrl }])
      setSelectedFile(null)
    }

    const aId = `a${Date.now()}`
    setMessages((m) => [...m, { id: aId, role: 'assistant', content: '' }])

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
      () => {}
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
    <div className="flex flex-col h-full p-4 text-foreground">
      {/* Prompt usage tracker */}
      <div className="flex justify-end mb-4">
        <PromptTracker used={promptsUsed} limit={promptLimit} />
      </div>

      {/* Initial Starter Prompt */}
      {messages.length === 0 && (
        <div className="text-center my-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow text-sm"
            onClick={() => {
              setInput('What can Growfly do for me?')
              handleSubmit()
            }}
          >
            What can Growfly do for me?
          </button>
          <p className="text-xs mt-2">
            Need inspiration? Try <strong>Nerdify Me!</strong>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`whitespace-pre-wrap text-sm p-4 rounded-xl shadow-sm max-w-2xl ${
              msg.role === 'user' ? 'bg-blue-50 self-end ml-auto' : 'bg-gray-100 self-start'
            }`}
          >
            <p className="text-xs mb-1 font-medium text-gray-500">
              {msg.role === 'user' ? '🧑 You' : '🤖 Growfly'}
            </p>
            {msg.imageUrl && (
              <Image src={msg.imageUrl} alt="uploaded" width={200} height={200} className="mb-2 rounded" />
            )}
            <p>{msg.content}</p>

            {msg.role === 'assistant' && (
              <>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {defaultFollowUps.slice(0, 2).map((fu, i) => (
                    <button
                      key={i}
                      className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded-full"
                      onClick={() => handleFollowUp(fu)}
                    >
                      {fu}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 text-lg">
                  <HiThumbUp title="Helpful" onClick={() => handleFeedback(msg)} className="cursor-pointer hover:text-green-500" />
                  <HiThumbDown title="Not helpful" onClick={() => handleFeedback(msg)} className="cursor-pointer hover:text-red-500" />
                  <FaRegBookmark title="Save response" onClick={() => handleSave(msg)} className="cursor-pointer hover:text-yellow-500" />
                  <FaShareSquare title="Send to Collab Zone" onClick={() => router.push('/collab-zone')} className="cursor-pointer hover:text-blue-500" />
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t pt-4 mt-4">
        <textarea
          rows={2}
          className="w-full p-3 rounded border bg-background resize-none text-sm"
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
          <div className="text-sm">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 underline">
              Upload Image / PDF
            </button>
            {selectedFile && (
              <span className="ml-2 text-xs text-muted-foreground">{selectedFile.name}</span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() && !selectedFile}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-md text-sm"
          >
            Send
          </button>
        </div>
      </div>

      {/* Modals */}
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