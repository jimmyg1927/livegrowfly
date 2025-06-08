'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { API_BASE_URL } from '@lib/constants'
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaLock, 
  FaArrowRight, 
  FaUserPlus,
  FaSpinner,
  FaRocket,
  FaChartLine,
  FaBrain
} from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')

      localStorage.setItem('growfly_jwt', data.token)

      // Fetch the user to determine plan and onboarding state
      const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
      const user = await userRes.json()

      if (!userRes.ok || !user) throw new Error('Failed to retrieve user.')

      const plan = user.subscriptionType || 'free'
      const onboarded = user.hasCompletedOnboarding

      if (!onboarded) {
        router.push('/onboarding')
      } else if (plan !== 'free') {
        router.push('/change-plan')
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      console.error('❌ Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* ✅ Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* ✅ Left Side - Features Showcase */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Welcome to Growfly
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              The AI-powered platform that transforms your business with intelligent automation and insights.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-2xl">
                  <FaBrain className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI-Powered Chat</h3>
                  <p className="text-gray-400 text-sm">Get instant answers and business insights</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Business Analytics</h3>
                  <p className="text-gray-400 text-sm">Data-driven insights for growth</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-3 rounded-2xl">
                  <FaRocket className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Scale Your Business</h3>
                  <p className="text-gray-400 text-sm">Automate and accelerate your growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12">
          <div className="max-w-md mx-auto w-full">
            
            {/* ✅ Logo */}
            <div className="text-center mb-8">
              <Image 
                src="/growfly-logo.png" 
                alt="Growfly Logo" 
                width={160} 
                height={45} 
                className="mx-auto mb-6"
              />
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
              <p className="text-gray-400">Sign in to continue your journey</p>
            </div>

            {/* ✅ Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            {/* ✅ Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* ✅ Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* ✅ Sign Up Button */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Don&apos;t have an account yet?
              </p>
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <FaUserPlus />
                Create Your Account
              </Link>
            </div>

            {/* ✅ Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-xs">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-purple-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}