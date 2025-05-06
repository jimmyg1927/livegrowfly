'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SignupClient() {
  const router = useRouter()

  const [plan, setPlan] = useState('free')
  const [referrerCode, setReferrerCode] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const selectedPlan = params.get('plan') || 'free'
    const refCode = params.get('ref') || null

    setPlan(selectedPlan)
    setReferrerCode(refCode)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, subscriptionType: plan, referrerCode }),
      })

      const contentType = res.headers.get('content-type')

      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json()
          setError(data.error || 'Something went wrong.')
        } else {
          setError('Unexpected server error. Please try again.')
        }
        return
      }

      const data = await res.json()

      if (data.token) {
        localStorage.setItem('growfly_jwt', data.token)
        router.push('/dashboard')
      } else {
        setError('Signup succeeded but no token returned.')
      }
    } catch (err) {
      setError('Network error or server is unreachable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e6f2ff] to-[#fefefe] px-4 py-12">
      <div className="bg-white text-black p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <button
          onClick={() => router.push('/plans')}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          ← Back to Plans
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center">
          🚀 Sign Up for {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </h1>

        {referrerCode && (
          <p className="text-sm text-green-600 mb-4 text-center">
            🎉 You were referred! Referrer Code: <strong>{referrerCode}</strong>
          </p>
        )}

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

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
            disabled={loading}
            className={`w-full py-2 rounded-xl text-white font-semibold ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800 transition'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
