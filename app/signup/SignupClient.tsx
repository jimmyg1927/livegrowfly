// app/signup/SignupClient.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams?.get('plan') || 'free'

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
        body: JSON.stringify({ name, email, password, plan: planFromUrl }),
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
          Sign Up for {planFromUrl.charAt(0).toUpperCase() + planFromUrl.slice(1)} Plan
        </h1>
        {message && <p className="text-red-400 text-center mb-4">{message}</p>}
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label htmlFor="name" className="block mb-1">Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-md border border-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border border-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-border bg-input text-textPrimary"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-border bg-input text-textPrimary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  )
}
