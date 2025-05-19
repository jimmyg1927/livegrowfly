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

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('growfly_jwt', data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#e6f7ff] px-6 py-12 text-black flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl p-10 space-y-6">
        <div className="flex items-center justify-center">
          <Image src="/growfly-logo.png" alt="Growfly Logo" width={140} height={40} />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-1">Log in to access your dashboard and AI tools</p>
        </div>

        {error && <p className="text-center text-red-500 font-medium text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
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
              placeholder="Your password"
            />
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1992FF] text-white font-semibold rounded-md hover:bg-[#157fdd] transition"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  )
}
