'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

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
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match!')
      return
    }

    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1992FF] to-[#5BC6FF] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="flex justify-center mb-5">
          <Image src="/growfly-logo.png" alt="Growfly" width={90} height={90} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-black">Create your Growfly Account</h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          You&apos;re joining the <span className="font-semibold capitalize">{selectedPlan}</span> plan
        </p>

        {message && (
          <p className="text-center text-red-500 text-sm font-medium mb-4">{message}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-5 text-black">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-gray-300 hover:border-[#1992FF] focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-gray-300 hover:border-[#1992FF] focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-gray-300 hover:border-[#1992FF] focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-gray-300 hover:border-[#1992FF] focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1992FF] text-white font-semibold rounded-md hover:bg-blue-600 transition"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account? <a href="/login" className="text-[#1992FF] underline">Log in</a>
        </p>
      </div>
    </main>
  )
}
// cache bust
