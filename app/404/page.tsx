'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FaRocket, 
  FaTools, 
  FaEnvelope, 
  FaArrowLeft, 
  FaHome,
  FaSpinner,
  FaCogs,
  FaLaptopCode,
  FaBug,
  FaGlobe
} from 'react-icons/fa'

export default function NotFoundPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Anonymous User',
          email,
          company: 'N/A',
          message: `404 Error Report: ${message}\n\nPage: ${window.location.href}\nUser Agent: ${navigator.userAgent}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setIsSubmitted(true)
      setEmail('')
      setMessage('')
    } catch (err) {
      setError('Failed to send message. Please try emailing us directly at support@growfly.io')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* ✅ Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* ✅ Logo */}
          <div className="mb-8">
            <Image 
              src="/growfly-logo.png" 
              alt="Growfly Logo" 
              width={200} 
              height={60} 
              className="mx-auto mb-6"
            />
          </div>

          {/* ✅ 404 Animation */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text mb-4 animate-pulse">
              404
            </div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <FaCogs className="text-purple-400 text-2xl animate-spin" />
              <FaTools className="text-blue-400 text-xl animate-bounce" />
              <FaLaptopCode className="text-cyan-400 text-2xl animate-pulse" />
            </div>
          </div>

          {/* ✅ Error Message */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Oops! Our Nerds Are On It! 🤓
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Looks like this page decided to take a coffee break.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Don't worry - our brilliant team of nerds are working around the clock to fix any issues. 
              While they're debugging, help us help you by sending details about what happened!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* ✅ Left Side - Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaRocket className="text-purple-400" />
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                {/* ✅ NEW: Take Me Home link to www.growfly.io */}
                <a
                  href="https://www.growfly.io"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <FaGlobe />
                  Take Me Home
                </a>
                
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <FaHome />
                  Go to Dashboard
                </Link>
                
                <button
                  onClick={() => router.back()}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <FaArrowLeft />
                  Go Back
                </button>
                
                <Link
                  href="/contact"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                >
                  <FaEnvelope />
                  Contact Support
                </Link>
              </div>
            </div>

            {/* ✅ Right Side - Bug Report Form */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaBug className="text-orange-400" />
                Help Our Nerds
              </h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-green-400 text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Thanks for helping!
                  </h3>
                  <p className="text-gray-400">
                    Our nerds received your report and are investigating. 
                    We'll get this fixed ASAP!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Email (so we can update you)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      What were you trying to do?
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                      placeholder="Describe what happened or what you were trying to access..."
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Sending to Nerds...
                      </>
                    ) : (
                      <>
                        <FaEnvelope />
                        Send Bug Report
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Reports go directly to{' '}
                    <span className="text-purple-400">support@growfly.io</span>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ✅ Footer */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Having trouble? Email us directly at{' '}
              <a 
                href="mailto:support@growfly.io" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                support@growfly.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}