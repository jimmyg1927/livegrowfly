'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { API_BASE_URL } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    console.log('🔍 Login submit triggered')

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      console.log('🔁 Login response:', res.status, data)

      if (!res.ok) {
        throw new Error(data?.error || 'Login failed')
      }

      localStorage.setItem('growfly_jwt', data.token)
      router.push(data.hasCompletedOnboarding ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] px-6 pt-10 pb-20 text-white flex flex-col items-center justify-center">
      <div className="mb-6">
        <Image src="/growfly-logo.png" alt="Growfly Logo" width={140} height={40} />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold">Welcome Back</h1>
        <p className="text-white/80 text-sm mt-1">Log in to access your dashboard and AI tools</p>
      </div>

      {error && (
        <p className="text-red-400 text-sm font-medium mb-4 text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white/10 text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/10 text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
            placeholder="Your password"
          />
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#1992FF] text-white font-semibold rounded-lg hover:bg-blue-600 transition"
        >
          Log In
        </button>
      </form>
    </main>
  )
}
