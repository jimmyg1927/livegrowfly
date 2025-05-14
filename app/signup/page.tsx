'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('free')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const planParam = params.get('plan')?.toLowerCase() || 'free'
    setSelectedPlan(planParam)
  }, [])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match!')
      return
    }
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: selectedPlan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')
      router.push('/welcome')
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-16 text-[var(--textPrimary)]">
      <div className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-center mb-2">Create your Growfly account</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          You're signing up for the{' '}
          <span className="font-semibold capitalize">{selectedPlan}</span> plan.
        </p>

        {message && (
          <p className="text-center text-red-500 text-sm font-medium mb-4">{message}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-md border border-[var(--input-border)] bg-[var(--input)] text-[var(--textPrimary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border border-[var(--input-border)] bg-[var(--input)] text-[var(--textPrimary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-[var(--input-border)] bg-[var(--input)] text-[var(--textPrimary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-[var(--input-border)] bg-[var(--input)] text-[var(--textPrimary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  )
}
