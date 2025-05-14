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
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-xl bg-card rounded-2xl shadow-lg p-8 border border-border text-textPrimary">
        <h1 className="text-3xl font-bold text-center mb-4">Create your Growfly account</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          You're signing up for the <span className="font-semibold capitalize">{selectedPlan}</span> plan.
        </p>

        {message && <p className="text-red-500 text-center text-sm mb-4">{message}</p>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-md transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  )
}
