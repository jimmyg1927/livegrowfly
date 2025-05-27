'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'
import { FaRegBookmark, FaShareSquare, FaTimes, FaDownload } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import PromptTracker from '@components/PromptTracker'
import SaveModal from '@components/SaveModal'
import FeedbackModal from '@components/FeedbackModal'
import streamChat, { StreamedChunk } from '@lib/streamChat'
import { useUserStore } from '@lib/store'
import { API_BASE_URL } from '@lib/constants'
import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import jsPDF from 'jspdf'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  collabId?: string
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
  const [isStreaming, setIsStreaming] = useState(false)

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

  const banned = ['joke', 'poem', 'love', 'story', 'fantasy', 'fun', 'chatgpt', 'bard', 'claude']
  const handleSubmit = async () => {
    const text = input.trim()
    if (!text && !selectedFile) return

    const isOffTopic = banned.some(k => text.toLowerCase().includes(k))
    if (isOffTopic) {
      setMessages((m) => [
        ...m,
        {
          id: `warn-${Date.now()}`,
          role: 'assistant',
          content:
            "We’re Growfly — a business-specific AI built in partnership with OpenAI. We only assist with professional, commercial or operational topics. " +
            "If you believe your prompt is relevant, please contact us through the dashboard.",
        },
      ])
      setInput('')
      return
    }

    const uId = `u${Date.now()}`
    const aId = `a${Date.now()}`
    setIsStreaming(true)
    setMessages((m) => [...m, { id: uId, role: 'user', content: text }])
    setInput('')

    let imageUrl: string | undefined
    if (selectedFile) {
      const data = new FormData()
      data.append('file', selectedFile)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })
      if (!res.ok) {
        toast.error('❌ Upload failed. Try again.')
        return
      }
      const { url } = await res.json()
      imageUrl = url
      setMessages((m) => [...m, { id: `f${Date.now()}`, role: 'user', content: '', imageUrl }])
      setSelectedFile(null)
    }

    setMessages((m) => [...m, { id: aId, role: 'assistant', content: '' }])

    await streamChat(
      text + (imageUrl ? `\n[Image: ${imageUrl}]` : ''),
      token,
      (chunk: StreamedChunk) => {
        if (!chunk.content) return
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg.id === aId
              ? { ...msg, content: msg.content + chunk.content! }
              : msg
          )
        )
      },
      () => setIsStreaming(false)
    )
  }

  const handleFollowUp = (q: string) => {
    setInput(q)
    handleSubmit()
  }

  const exportPDF = (msg: Message) => {
    const doc = new jsPDF()
    doc.text(msg.content, 10, 10)
    doc.save(`${msg.id}.pdf`)
  }

  const exportDOCX = async (msg: Message) => {
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph({ children: [new TextRun(msg.content)] })],
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${msg.id}.docx`)
  }

  const saveToCollabZone = async (msg: Message) => {
    const res = await fetch('/api/collab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'AI Response', content: msg.content }),
    })
    const result = await res.json()
    if (res.ok && result.id) {
      toast.success('📤 Sent to Collab Zone')
      router.push(`/collab-zone?doc=${result.id}`)
    } else {
      toast.error('❌ Failed to share')
    }
  }

  return (
    <div className="flex flex-col h-full p-4 text-foreground">
      <Toaster position="bottom-right" />
      <div className="flex justify-end mb-4">
        <PromptTracker used={promptsUsed} limit={promptLimit} />
      </div>

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
          <p className="text-xs mt-2">Need inspiration? Try <strong>Nerdify Me!</strong></p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pb-6 max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`whitespace-pre-wrap text-sm p-4 rounded-xl shadow-sm ${
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
              <div className="flex flex-wrap gap-2 mt-3 text-lg">
                <HiThumbUp onClick={() => toast.success('👍 Thanks')} className="cursor-pointer hover:text-green-500" />
                <HiThumbDown onClick={() => toast.success('👎 Feedback noted')} className="cursor-pointer hover:text-red-500" />
                <FaRegBookmark onClick={() => { setSaveContent(msg.content); setShowSaveModal(true) }} className="cursor-pointer hover:text-yellow-500" />
                <FaShareSquare onClick={() => saveToCollabZone(msg)} className="cursor-pointer hover:text-blue-500" />
                <FaDownload onClick={() => exportPDF(msg)} className="cursor-pointer hover:text-indigo-500" title="Download PDF" />
                <button
                  onClick={() => exportDOCX(msg)}
                  className="text-xs border px-2 py-1 rounded hover:bg-gray-200"
                >
                  DOCX
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

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
          <div className="text-sm flex items-center gap-2">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="hidden"
              ref={fileInputRef}
            />
            <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 underline">
              Upload Image / PDF
            </button>
            {selectedFile && (
              <span className="flex items-center gap-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {selectedFile.name}
                <FaTimes
                  className="cursor-pointer text-red-500"
                  onClick={() => setSelectedFile(null)}
                />
              </span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isStreaming || (!input.trim() && !selectedFile)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-md text-sm"
          >
            {isStreaming ? 'Sending...' : 'Send'}
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
            toast.success('✅ Saved')
            setShowSaveModal(false)
          }}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          responseId={feedbackTargetId}
          open={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={() => {
            setShowFeedbackModal(false)
            toast.success('✅ Feedback submitted')
          }}
        />
      )}
    </div>
  )
}
