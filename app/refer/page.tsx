'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Share2, Gift, Users, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ReferralData {
  referralCode: string
  referralCredits: number
  totalReferrals: number
}

export default function ReferPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('growfly_jwt')
        if (!token) {
          setError('Please log in to view your referral information')
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/referral-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch referral data')
        }

        const data = await response.json()
        setReferralData(data)
        
        // Generate the actual referral URL - using onboarding instead of register
        const referralUrl = `${window.location.origin}/onboarding?ref=${data.referralCode}`
        setShareUrl(referralUrl)
        
      } catch (error) {
        console.error('Error fetching referral data:', error)
        setError('Failed to load referral information. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleCopyAll = () => {
    const fullText = `🚀 Join me on Growfly — an AI-powered growth tool for entrepreneurs! Get 40 prompts to start (20 free + 20 referral bonus) when you sign up: ${shareUrl}`
    copyToClipboard(fullText, 'all')
  }

  const encodedMsg = encodeURIComponent(
    `Join Growfly - AI-powered growth tools for entrepreneurs and businesses. Get 40 prompts to start (20 free + 20 referral bonus) to supercharge your productivity: ${shareUrl}`
  )

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMsg}`,
    whatsapp: `https://wa.me/?text=${encodedMsg}`,
    email: `mailto:?subject=Join Growfly - AI Growth Tools&body=${encodedMsg}`,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-slate-300 text-sm">Loading your referral details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-800 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Error</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Refer a Friend
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Invite your network to Growfly — they&apos;ll get <span className="font-bold text-blue-600 dark:text-blue-400">40 prompts to start</span> (20 free + 20 referral bonus) and you&apos;ll earn <span className="font-bold text-purple-600 dark:text-purple-400">20 bonus prompts</span> for every successful signup.
          </p>
        </div>

        {/* Stats Cards */}
        {referralData && (
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{referralData.referralCredits}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bonus Prompts Earned</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{referralData.totalReferrals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful Referrals</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{referralData.referralCode}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your Referral Code</div>
              </div>
            </div>
          </div>
        )}

        {/* Referral Tools */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Referral Link</h2>

          <div className="space-y-4">
            {/* Referral Link */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    copied === 'link' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                >
                  {copied === 'link' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Copy Full Message */}
            <div className="pt-2">
              <button
                onClick={handleCopyAll}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  copied === 'all' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {copied === 'all' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Message Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Full Message
                  </>
                )}
              </button>
            </div>

            {/* Share Directly */}
            <div className="pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Share directly to these platforms:</p>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={shareLinks.email}
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Email <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0077B5] hover:bg-[#005885] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  X <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  WhatsApp <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Why Refer Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Why refer people to Growfly?</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">AI-Powered Growth</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Help businesses accelerate growth with smart prompts and AI tools
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎁</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Earn Rewards</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get 20 bonus prompts for every successful referral - unlimited earning potential
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Win-Win</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your friends save time, you grow your toolkit - everybody wins
              </p>
            </div>
          </div>
        </div>

        {/* How It Works - Expanded */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <button
            className="flex items-center justify-between w-full text-left mb-4 focus:outline-none"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">How does the referral system work?</h3>
            {showHowItWorks ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {showHowItWorks && (
            <div className="space-y-6 pt-2">
              {/* Step by step process */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Share Your Unique Link</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Copy and share your personalized referral link. Each user has a unique code that tracks referrals back to you.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Friend Clicks & Signs Up</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">When someone clicks your link and creates an account, they automatically get 40 prompts to start with (20 free + 20 referral bonus).</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">You Earn Instant Rewards</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">As soon as they complete registration, 20 bonus prompts are automatically added to your account balance.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Keep Growing Together</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">No limits on referrals. The more people you help discover Growfly, the more prompts you earn.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical details */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Technical Details:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="mb-2"><strong>Link Tracking:</strong> Your referral code is embedded in the URL, ensuring proper attribution.</p>
                    <p className="mb-2"><strong>Instant Credit:</strong> Rewards are processed automatically when someone completes registration.</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Fair System:</strong> Each signup is tracked to prevent duplicate credits for the same person.</p>
                    <p className="mb-2"><strong>No Expiry:</strong> Your referral credits never expire and can be used anytime.</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">Requirements for earning referral credits:</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• The person must be a new user (email not already registered)</li>
                  <li>• They must complete the full registration process</li>
                  <li>• They must use your referral link or enter your code during signup</li>
                  <li>• Credits are added immediately upon successful account creation</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}