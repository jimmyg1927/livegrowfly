'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark, FaShareSquare, FaFileDownload } from 'react-icons/fa'
import PromptTracker from '@/components/PromptTracker'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
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

  const handleStream = async (prompt: string, aId: string) => {
    let fullContent = ''
    await streamChat(
      prompt,
      token,
      (chunk: StreamedChunk) => {
        if (!chunk.content) return
        fullContent += chunk.content
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
      () => {}
    )
  }

  const handleSubmit = async () => {
    const text = input.trim()
    if (!text && !selectedFile) return

    const uId = `u${Date.now()}`
    setMessages((m) => [...m, { id: uId, role: 'user', content: text }])
    setInput('')

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
              msg.id === aId ? { ...msg, content: data.content, imageUrl: base64 } : msg
            )
          )
        } catch (err) {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aId ? { ...msg, content: '❌ Failed to analyze image.' } : msg
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    const preview = URL.createObjectURL(file)
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', content: file.name, imageUrl: preview }])
    setSelectedFile(file)
  }

  const handleFollowUp = (q: string) => {
    const uId = `u${Date.now()}`
    const aId = `a${Date.now()}`
    setMessages((m) => [...m, { id: uId, role: 'user', content: q }, { id: aId, role: 'assistant', content: '' }])
    handleStream(q, aId)
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
    <div className="flex flex-col h-full p-4 bg-muted text-textPrimary transition-colors duration-300">
      <div className="flex justify-between mb-4 items-center">
        <PromptTracker used={promptsUsed} limit={promptLimit} />
      </div>

      {messages.length === 0 && (
        <div className="text-center my-6">
          <button
            className="bg-accent text-white px-4 py-2 rounded-full shadow text-sm hover:brightness-110"
            onClick={() => handleFollowUp('What can Growfly do for me?')}
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
                ? 'bg-accent text-white self-end ml-auto'
                : 'bg-card text-textPrimary self-start'
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
                      onClick={() => handleFollowUp(fu)}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                    >
                      {fu}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-lg">
                  <HiThumbUp onClick={() => handleFeedback(msg)} className="cursor-pointer hover:text-green-500" />
                  <HiThumbDown onClick={() => handleFeedback(msg)} className="cursor-pointer hover:text-red-500" />
                  <FaRegBookmark onClick={() => handleSave(msg)} className="cursor-pointer hover:text-yellow-500" />
                  <FaShareSquare onClick={() => router.push('/collab-zone')} className="cursor-pointer hover:text-blue-500" />
                  {msg.imageUrl && (
                    <FaFileDownload onClick={() => downloadFile(msg, 'docx')} className="cursor-pointer hover:text-gray-600" />
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
          <div className="text-sm">
            <div
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) setSelectedFile(file)
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-blue-400 px-4 py-2 rounded text-blue-600 hover:bg-blue-50"
            >
              📎 Upload Image / PDF
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">{selectedFile.name}</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() && !selectedFile}
            className="bg-accent hover:bg-accent/90 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-full text-sm shadow transition-all"
          >
            ➤ Send
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
