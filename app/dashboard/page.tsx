// File: app/dashboard/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark, FaShareSquare, FaFileDownload } from 'react-icons/fa'
import PromptTracker from '@components/PromptTracker'
import SaveModal from '@components/SaveModal'
import FeedbackModal from '@components/FeedbackModal'
import streamChat, { StreamedChunk } from '@lib/streamChat'
import { useUserStore } from '@lib/store'
import { API_BASE_URL } from '@lib/constants'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  followUps?: string[]
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
  const chatKey = typeof window !== 'undefined' && user?.id ? `growfly_chat_${user.id}` : ''

  useEffect(() => {
    if (!token) router.push('/onboarding')
  }, [token])

  useEffect(() => {
    if (!chatKey) return
    const stored = localStorage.getItem(chatKey)
    if (stored) {
      try {
        const hist = JSON.parse(stored) as Message[]
        setMessages(hist.slice(-5))
      } catch {
        console.warn('⚠️ Failed to parse user-specific chat history')
      }
    }
  }, [chatKey])

  useEffect(() => {
    if (chatKey) {
      localStorage.setItem(chatKey, JSON.stringify(messages))
    }
  }, [messages, chatKey])

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
      setSelectedFile(null)
    }

    const aId = `a${Date.now()}`
    setMessages((m) => [...m, { id: aId, role: 'assistant', content: '' }])

    let content = ''
    await streamChat(
      text + (imageUrl ? `\n\n[Image URL: ${imageUrl}]` : ''),
      token,
      (chunk: StreamedChunk) => {
        if (!chunk.content) return
        content += chunk.content
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aId ? { ...msg, content: content } : msg
          )
        )
      },
      () => {
        fetch(`${API_BASE_URL}/api/ai/followup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answer: content }),
        })
          .then(res => res.json())
          .then(data => {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aId ? { ...msg, followUps: data.followUps || [] } : msg
              )
            )
          })
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSave = (msg: Message) => {
    setSaveContent(msg.content)
    setShowSaveModal(true)
  }

  const handleFeedback = (msg: Message) => {
    setFeedbackTargetId(msg.id)
    setShowFeedbackModal(true)
  }

  const downloadFile = (msg: Message, type: 'pdf' | 'docx') => {
    const url = `${API_BASE_URL}/api/download?type=${type}&content=${encodeURIComponent(msg.content)}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col h-full p-4 text-foreground">
      <div className="flex justify-between mb-4 items-center">
        <PromptTracker used={promptsUsed} limit={promptLimit} />
      </div>

      {messages.length === 0 && (
        <div className="text-center my-6">
          <button
            className="bg-[#3399ff] hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow text-sm"
            onClick={() => {
              setInput('What can Growfly do for me?')
              handleSubmit()
            }}
          >
            What can Growfly do for me?
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`whitespace-pre-wrap text-sm p-4 rounded-xl shadow-sm max-w-2xl ${
              msg.role === 'user'
                ? 'bg-[#3399ff] text-white self-end ml-auto'
                : 'bg-gray-100 dark:bg-[#1e1e1e] self-start'
            }`}
          >
            {msg.imageUrl && (
              <Image
                src={msg.imageUrl}
                alt="Uploaded file"
                width={200}
                height={200}
                className="mb-2 rounded"
              />
            )}
            <p>{msg.content}</p>

            {msg.role === 'assistant' && (
              <>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {msg.followUps?.map((fu, i) => (
                    <button
                      key={i}
                      onClick={() => handleFollowUp(fu)}
                      className="bg-blue-200 hover:bg-blue-300 text-sm px-3 py-1 rounded-full"
                    >
                      {fu}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 text-lg">
                  <HiThumbUp onClick={() => handleFeedback(msg)} className="cursor-pointer hover:text-green-500" />
                  <HiThumbDown onClick={() => handleFeedback(msg)} className="cursor-pointer hover:text-red-500" />
                  <FaRegBookmark onClick={() => handleSave(msg)} className="cursor-pointer hover:text-yellow-500" />
                  <FaShareSquare onClick={() => router.push('/collab-zone')} className="cursor-pointer hover:text-blue-500" />
                  <FaFileDownload onClick={() => downloadFile(msg, 'docx')} className="cursor-pointer hover:text-gray-600" />
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t pt-4 mt-4" onDrop={handleDrop} onDragOver={handleDragOver}>
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
          <div className="text-sm flex items-center gap-3">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#3399ff] text-white px-3 py-1 rounded text-sm"
            >
              Upload Image / PDF
            </button>
            {selectedFile && (
              <span className="text-xs text-muted-foreground">{selectedFile.name}</span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() && !selectedFile}
            className="bg-[#3399ff] hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-md text-sm"
          >
            Send
          </button>
        </div>
      </div>

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
