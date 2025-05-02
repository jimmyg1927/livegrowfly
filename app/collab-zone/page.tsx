'use client'

import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

export default function CollabZonePage() {
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return

    fetch(`${API_BASE_URL}/api/collab`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) setContent(data.content)
      })
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">📝 Collab Zone</h1>
      <textarea
        className="w-full h-[300px] p-4 rounded-xl bg-card text-textPrimary border border-muted focus:outline-accent resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write or paste AI responses here..."
      />
      <div className="flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="bg-accent text-background px-4 py-2 rounded-xl hover:bg-accent/90 transition"
        >
          {copied ? '✅ Copied!' : 'Copy to Clipboard'}
        </button>
        <p className="text-sm text-muted">Sharing & documents coming soon…</p>
      </div>
    </div>
  )
}
