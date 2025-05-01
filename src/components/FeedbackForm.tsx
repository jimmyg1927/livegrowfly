'use client'

import React, { useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

export interface FeedbackFormProps {
  onCreated: () => void
}

export default function FeedbackForm({ onCreated }: FeedbackFormProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    try {
      const token = localStorage.getItem('growfly_jwt')
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: value }),
      })
      setValue('')
      onCreated()
    } catch {
      // swallow
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Share your feedback…"
        className="w-full p-4 rounded bg-white text-black"
        rows={3}
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition"
      >
        {loading ? '…' : 'Submit Feedback'}
      </button>
    </form>
  )
}
