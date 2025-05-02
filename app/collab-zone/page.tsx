'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Editor from '@/components/editor/Editor'
import { FiCopy, FiSave } from 'react-icons/fi'

interface CollabDoc {
  id: string
  content: string
  createdAt: string
}

export default function CollabZonePage() {
  const router = useRouter()
  const [doc, setDoc] = useState<CollabDoc | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch the latest shared document
  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) {
      router.push('/login')
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collab`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load')
        const data = (await res.json()) as CollabDoc
        setDoc(data)
        setContent(data.content)
      })
      .catch(() => {
        // no previous doc, start fresh
        setContent('')
      })
      .finally(() => setLoading(false))
  }, [router])

  // Copy current content to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    alert('Copied to clipboard!')
  }

  // Save (or re-save) the current content
  const handleSave = async () => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!res.ok) {
      alert('Failed to save. Try again?')
      return
    }

    const saved = (await res.json()) as CollabDoc
    setDoc(saved)
    alert('Saved successfully!')
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading Collab Zone…</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Title */}
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <span>📄</span> Collab Zone
      </h1>
      {/* Subtitle */}
      <p className="text-gray-400">
        Share Growfly responses with colleagues and friends to improve, document
        and collaborate.
      </p>

      {/* Editor */}
      <div className="border rounded-lg overflow-hidden">
        <Editor content={content} setContent={setContent} />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          <FiCopy /> Copy
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          <FiSave /> Save
        </button>
      </div>
    </div>
  )
}
