'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlan = searchParams?.get('plan') || 'free'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: selectedPlan }),
      })

      const data = await res.json()
      if (data?.token) {
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        alert(data.error || 'Signup failed')
      }
    } catch (error) {
      alert('Error during signup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-gray-900 text-textPrimary flex items-center justify-center px-4">
      <div className="bg-white text-textPrimary p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <button
          onClick={() => router.push('/plans')}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          ← Back to Plans
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center">
          🚀 Sign Up for {selectedPlan === 'free' ? 'Free Plan' : selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-textPrimary font-semibold py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
