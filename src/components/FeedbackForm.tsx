'use client'

import React, { useState, FormEvent } from 'react'
import { API_BASE_URL } from '@/lib/constants'

interface FeedbackFormProps {
  onCreated: () => void
}

export default function FeedbackForm({
  onCreated,
}: FeedbackFormProps): JSX.Element {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('growfly_jwt')
      if (!token) throw new Error('Missing auth token')
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed to submit feedback')
      setContent('')
      onCreated()
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      {error && <div className="text-sm text-red-400">{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your feedback…"
        rows={3}
        required
        className="w-full p-3 bg-card rounded border border-card text-textPrimary focus:outline-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition"
      >
        {loading ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  )
}
