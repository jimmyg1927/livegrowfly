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
    `Join Growfly - AI-powered growth tools for entrepreneurs and businesses. Get 20 free prompts to supercharge your productivity: ${shareUrl}`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Refer a Friend
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Invite your network to Growfly — they&apos;ll get <span className="font-bold text-blue-600 dark:text-blue-400">20 free prompts</span> and you&apos;ll earn <span className="font-bold text-purple-600 dark:text-purple-400">20 bonus prompts</span> for every signup.
          </p>
        </div>

        {/* Referral Tools */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Referral Link</h2>

          <div className="space-y-4">
            {/* Referral Link */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={shareUrl || 'Loading...'}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
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

            {/* Share Directly */}
            <div className="pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Share directly to these platforms:</p>
              <div className="flex gap-3">
                <a
                  href={shareLinks.email}
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Email <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0077B5] hover:bg-[#005885] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  X <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Referral Bonus Display */}
            {referralBonus !== null && referralBonus > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  🎉 You&apos;ve earned {referralBonus} bonus prompts from referrals!
                </p>
              </div>
            )}
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
                Get 20 bonus prompts for every successful referral - unlimited
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

        {/* How It Works */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <button
            className="flex items-center justify-between w-full text-left mb-4"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">How does this work?</h3>
            {showHowItWorks ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {showHowItWorks && (
            <div className="space-y-4 pt-2">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Share Your Link</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Copy and share your unique referral link</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Friend Signs Up</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">They get 20 free prompts when registering</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">You Earn Rewards</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Get 20 bonus prompts added instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Keep Growing</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">No limits - invite unlimited friends</p>
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