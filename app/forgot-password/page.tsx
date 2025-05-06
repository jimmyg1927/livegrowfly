'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/constants'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Request failed')
      }
      setStatus('sent')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-background text-textPrimary">
      <h1 className="text-2xl mb-4">Forgot Password</h1>

      {status === 'sent' ? (
        <div className="space-y-2">
          <p className="text-green-600">
            If that email exists in our system, you’ll receive a reset link shortly.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted">
            Enter the email you signed up with and we’ll send you a reset link.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={status === 'sending'}
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {status === 'sending' ? 'Sending…' : 'Send Reset Link'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="text-center mt-2">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
