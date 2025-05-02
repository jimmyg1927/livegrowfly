'use client'

import React, { useState, useEffect } from 'react'
import Editor from '@/components/Editor'
import { useRouter } from 'next/navigation'

export default function CollabZonePage() {
  const [activeDoc, setActiveDoc] = useState<{ content: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // TEMPORARY MOCK – Replace with real auth logic when available
  useEffect(() => {
    const mockUser = { id: 1, name: 'Demo User' }
    setUser(mockUser)
    setActiveDoc({ content: '' })
  }, [])

  const handleContentChange = async (content: string) => {
    setActiveDoc({ content })
    // ⏳ TODO: Persist this via API call or save to state
  }

  const handleSetContent = (newContent: string) => {
    setActiveDoc(prev => ({ ...(prev || {}), content: newContent }))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">📄 Collab Zone</h1>
      <p className="text-gray-400 mb-4 text-sm">
        Share Growfly responses with colleagues and friends to improve, document and collaborate on plans, documents and other responses from Growfly.
      </p>

      <div className="bg-zinc-900 p-4 rounded-lg min-h-[300px] border border-zinc-800">
        <Editor
          content={activeDoc?.content || ''}
          onChange={handleContentChange}
          setContent={handleSetContent}
        />
      </div>

      <p className="text-right text-sm text-gray-500 mt-4">
        Sharing & documents coming soon...
      </p>
    </div>
  )
}
