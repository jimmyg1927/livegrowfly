'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const planParam = params.get('plan')?.toLowerCase() || 'free'
    setSelectedPlan(planParam)
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match!')
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: selectedPlan }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      localStorage.setItem('growfly_jwt', data.token)

      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      })
      const user = await meRes.json()

      router.push(user.hasCompletedOnboarding ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
    }
  }

  return (
    <main className="min-h-screen bg-[#e6f7ff] px-6 py-12 text-black flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl p-10 space-y-6">
        <div className="flex items-center justify-center">
          <Image src="/growfly-logo.png" alt="Growfly Logo" width={140} height={40} />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your Growfly Account</h1>
          <p className="text-sm text-gray-600 mt-1">
            You&apos;re joining the <span className="font-semibold capitalize">{selectedPlan}</span> plan
          </p>
        </div>

        {message && <p className="text-center text-red-500 font-medium text-sm">{message}</p>}

        <form onSubmit={handleSignup} className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1992FF] text-white font-semibold rounded-md hover:bg-[#157fdd] transition"
          >
            Sign Up & Start
          </button>
        </form>
      </div>
    </main>
  )
}
