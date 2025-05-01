'use client'

import React, { useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

interface FeedbackFormProps {
  onCreated: () => void
}

export default function FeedbackForm({ onCreated }: FeedbackFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('growfly_jwt')
      const res = await fetch(\`\${API_BASE_URL}/api/feedback\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error('Failed to submit feedback')
      setContent('')
      onCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your feedback…"
        required
        rows={3}
        className="w-full p-3 rounded bg-card text-textPrimary border border-card focus:outline-accent"
      />
      <div className="flex items-center space-x-4">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition"
        >
          {loading ? 'Submitting…' : 'Submit Feedback'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </form>
  )
}
