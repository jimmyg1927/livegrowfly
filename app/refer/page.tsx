'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Share2, Gift, Users, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

// Mock constants for artifact
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'

export default function ReferPage() {
  const [code, setCode] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [referralBonus, setReferralBonus] = useState<number | null>(null)
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(true)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('growfly_jwt')
        if (!token) {
          console.error('No authentication token found')
          setLoading(false)
          return
        }

        // Use consistent API endpoint
        const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await res.json()
        console.log('User data received:', data)

        if (data.referralCode) {
          setCode(data.referralCode)
          setShareUrl(`${window.location.origin}/register?ref=${data.referralCode}`)
        }
        
        if (typeof data.referralBonus === 'number') {
          setReferralBonus(data.referralBonus)
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
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
    const fullText = `🚀 Join me on Growfly — an AI-powered growth tool for entrepreneurs! Get 20 free prompts when you sign up: ${shareUrl} or use code: ${code}`
    copyToClipboard(fullText, 'all')
  }

  const encodedMsg = encodeURIComponent(
    `🚀 Join me on Growfly — an AI-powered growth tool built for entrepreneurs. Get 20 free prompts when you sign up with my link: ${shareUrl}`
  )

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMsg}`,
    whatsapp: `https://wa.me/?text=${encodedMsg}`,
    email: `mailto:?subject=Join me on Growfly&body=${encodedMsg}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Refer a Friend 💙
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Invite your network to Growfly — they&apos;ll get <span className="font-bold text-blue-600 dark:text-blue-400">20 free prompts</span> and you&apos;ll earn <span className="font-bold text-purple-600 dark:text-purple-400">20 bonus prompts</span> for every signup.
          </p>
        </div>

        {/* Referral Tools */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Referral Tools</h2>
          </div>

          <div className="space-y-8">
            {/* Referral Link */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                Your Referral Link:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={shareUrl || 'Loading...'}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm font-mono"
                />
                <button
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl ${
                    copied === 'link' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  disabled={!shareUrl}
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

            {/* Referral Code */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                Referral Code:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-6 py-4">
                  <code className="text-2xl font-bold font-mono text-blue-800 dark:text-blue-300">
                    {code || 'Loading...'}
                  </code>
                </div>
                <button
                  onClick={() => code && copyToClipboard(code, 'code')}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl ${
                    copied === 'code' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  disabled={!code}
                >
                  {copied === 'code' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Copy All Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleCopyAll}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  copied === 'all' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white'
                }`}
              >
                {copied === 'all' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied Complete Message!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Complete Message
                  </>
                )}
              </button>
            </div>

            {/* Referral Bonus Display */}
            {referralBonus !== null && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                    You&apos;ve earned {referralBonus} bonus prompts from referrals!
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Keep sharing to unlock even more prompts 🚀
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Why Refer Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why refer people to Growfly?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Supercharge Growth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help startups and businesses accelerate their growth with AI-powered tools
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Earn Rewards</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get 20 bonus prompts for every successful referral - no limits!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Win-Win</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your friends save time, you grow your toolkit - everybody wins
              </p>
            </div>
          </div>
        </div>

        {/* Share Directly */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Share Directly:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#0077B5] hover:bg-[#005885] text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              LinkedIn <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              X (Twitter) <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              WhatsApp <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={shareLinks.email}
              className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Email <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">How does this work?</h3>
            {showHowItWorks ? (
              <ChevronUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {showHowItWorks && (
            <div className="mt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Share Your Link</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Copy your unique referral link or code and share it with friends</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Friend Signs Up</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">They get 20 free prompts when they register with your link</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">You Earn Rewards</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get 20 bonus prompts added to your account instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Keep Growing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No limits! Invite as many friends as you want and stack rewards</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}