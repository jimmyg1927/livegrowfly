// src/components/AskGrowfly.tsx
'use client'

import React, { useState } from 'react'
import { defaultFollowUps } from '../lib/constants'

export default function AskGrowfly() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [followUps, setFollowUps] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendPrompt() {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unknown error')
      setResponse(json.response)
      setFollowUps(json.followUps)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 overflow-x-auto">
        {defaultFollowUps.map((p, i) => (
          <button
            key={i}
            className="px-3 py-1 bg-accent text-black rounded"
            onClick={() => setMessage(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          className="flex-1 rounded border px-4 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          placeholder="Type your prompt here…"
        />
        <button
          className="px-4 bg-primary text-white rounded"
          onClick={sendPrompt}
          disabled={loading || !message.trim()}
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {response && (
        <div className="space-y-2">
          <h2 className="font-bold">Growfly Response</h2>
          <div className="bg-card p-4 rounded">{response}</div>
          <div className="flex space-x-2 overflow-x-auto">
            {followUps.map((f, i) => (
              <button
                key={i}
                className="px-3 py-1 bg-secondary rounded"
                onClick={() => setMessage(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
