'use client'

import { useState } from 'react'
import { API_BASE_URL } from '@lib/constants'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setMessage('✅ Reset link sent if the email exists.')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#030712] to-[#1e3a8a] text-textPrimary flex items-center justify-center px-4 py-12">
      <div className="bg-white text-textPrimary p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-[#1992FF]">Forgot your password?</h1>
        <p className="text-center text-gray-600 mb-6">
          No worries. Enter your email and we’ll send a reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100"
          />
          <button
            type="submit"
            className="w-full py-3 bg-accent text-textPrimary font-semibold rounded-xl hover:brightness-110 transition"
          >
            Send Reset Link
          </button>
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  )
}
