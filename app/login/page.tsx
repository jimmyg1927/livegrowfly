'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message || 'Login failed')
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-background text-textPrimary">
      <h1 className="text-2xl mb-4">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  )
}
