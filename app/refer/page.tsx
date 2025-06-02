'use client'

import React, { useEffect, useState } from 'react'

export default function ReferPage() {
  const [code, setCode] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [referralBonus, setReferralBonus] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.referralCode) {
          setCode(data.referralCode)
          setShareUrl(`${window.location.origin}/register?ref=${data.referralCode}`)
        }
        if (typeof data.referralBonus === 'number') {
          setReferralBonus(data.referralBonus)
        }
        setLoading(false)
      })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyAll = () => {
    const fullText = `Join Growfly with my link: ${shareUrl} or use my code: ${code}`
    copyToClipboard(fullText)
  }

  const encodedMsg = encodeURIComponent(
    `🚀 Join me on Growfly — an AI-powered growth tool built for entrepreneurs. Get 20 free prompts when you sign up with my link: ${shareUrl}`
  )

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMsg}`,
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Refer a Friend 💙</h1>
      <p className="text-muted mb-4">
        Invite your network to Growfly — they’ll get <b>20 free prompts</b> and you’ll earn <b>20 bonus prompts</b> for every signup.
      </p>

      <div className="bg-card p-6 rounded-xl shadow space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Your Referral Link:</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              placeholder={loading ? 'Loading...' : '—'}
              className="flex-1 px-4 py-2 rounded bg-background border border-gray-300"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => copyToClipboard(shareUrl)}
              disabled={!shareUrl}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Referral Code:</h2>
          <div className="flex items-center space-x-2">
            <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">{code || '—'}</code>
            <button
              onClick={() => code && copyToClipboard(code)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
              disabled={!code}
            >
              Copy Code
            </button>
            <button
              onClick={handleCopyAll}
              className="bg-gray-200 text-sm px-3 py-1 rounded hover:bg-gray-300"
            >
              Copy All
            </button>
          </div>
        </div>

        {referralBonus !== null && (
          <div className="pt-2 text-sm text-muted">
            🎁 You’ve earned <b>{referralBonus}</b> bonus prompts from referrals.
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold">Why refer people to Growfly?</h3>
        <p className="text-muted text-sm leading-relaxed">
          Growfly helps startups, freelancers and business owners supercharge their output with
          AI-powered prompts. The more people you invite, the more free prompts you unlock — it’s a
          win-win. Your friends save time, and you grow your own toolkit.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Share Directly:</h3>
        <div className="flex gap-3">
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0077B5] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Share on LinkedIn
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1DA1F2] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Share on X
          </a>
        </div>
      </div>

      <div className="mt-8">
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => setShowHowItWorks((prev) => !prev)}
        >
          {showHowItWorks ? 'Hide How It Works' : 'How does this work?'}
        </button>

        {showHowItWorks && (
          <div className="mt-4 text-sm bg-background p-4 rounded border">
            <ul className="list-disc ml-5 space-y-1">
              <li>Each friend who signs up using your link or code gets 20 free prompts.</li>
              <li>You earn 20 bonus prompts for every successful signup.</li>
              <li>Your bonus prompts stack — invite as many as you want.</li>
              <li>Use this page to copy and share your referral details easily.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
