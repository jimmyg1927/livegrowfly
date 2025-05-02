'use client'

import React, { useState, useEffect } from 'react'
import Editor from '@/components/editor/Editor'    // ← updated path
import { useRouter } from 'next/navigation'

export default function CollabZonePage() {
  const [content, setContent] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) {
      router.push('/login')
      return
    }
    // Load existing collab content (if any)
    fetch('/api/collab', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setContent(data.content || ''))
      .catch(() => console.warn('No collab content found'))
  }, [router])

  const handleSave = async () => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return
    await fetch('/api/collab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })
    alert('Saved!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">📄 Collab Zone</h1>
      <p className="text-gray-400">
        Share Growfly responses with colleagues and friends to improve, document and collaborate.
      </p>

      <Editor content={content} setContent={setContent} />

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(content)
            alert('Copied!')
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Copy
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  )
}
