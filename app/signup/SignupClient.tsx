// File: app/signup/SignupClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignupClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [plan, setPlan] = useState('Free')

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const planFromURL = searchParams?.get('plan')
    if (planFromURL) {
      const capitalizedPlan = planFromURL.charAt(0).toUpperCase() + planFromURL.slice(1)
      setPlan(capitalizedPlan)
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')
      router.push('/welcome')
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-card p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center text-textPrimary">
        Sign Up for {plan} Plan
      </h1>

      {message && <p className="text-red-600 text-center">{message}</p>}

      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <label htmlFor="name" className="text-lg text-textPrimary">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-lg text-textPrimary">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-lg text-textPrimary">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-lg text-textPrimary">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-input-border bg-input text-textPrimary"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded-lg transition-colors"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  )
}
