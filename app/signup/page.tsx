'use client'
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const selectedPlan = (params?.get('plan') ?? 'free').toLowerCase()

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
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-black flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-4">
          Create your Growfly account
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          You&apos;re signing up for the{' '}
          <span className="font-semibold uppercase">{selectedPlan}</span> plan.
        </p>

        {message && (
          <p className="text-red-400 text-center text-sm mb-4">{message}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-1 text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2 rounded-lg transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  )
}
