'use client'

import { useEffect, useState } from 'react'

export default function CollabZone() {
  const [documentContent, setDocumentContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const jwt = localStorage.getItem('growfly_jwt')
    if (!jwt) return
    setToken(jwt)

    fetch('/api/collab', {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => res.json())
      .then((data) => setDocumentContent(data.content || ''))
      .catch(() => setDocumentContent(''))
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">📄 Collab-Zone: Shared Document</h2>

      <textarea
        className="w-full min-h-[300px] bg-muted text-foreground border border-border rounded-xl p-4 text-sm leading-relaxed shadow resize-none"
        placeholder="Start writing your document here or paste AI responses..."
        value={documentContent}
        onChange={(e) => setDocumentContent(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="bg-primary text-white text-sm px-4 py-2 rounded-xl hover:bg-primary/80 transition"
        >
          {copied ? '✅ Copied!' : 'Copy Document'}
        </button>
        <p className="text-xs text-muted-foreground">🔗 Shareable links & invites coming soon…</p>
      </div>
    </div>
  )
}
