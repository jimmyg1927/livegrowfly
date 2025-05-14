'use client'

import React, { useEffect, useState } from 'react'

export default function ReferPage() {
  const [code, setCode] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

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
          setShareUrl(`${window.location.origin}/signup?ref=${data.referralCode}`)
        }
      })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Refer a Friend 💙</h1>
      <p className="text-muted mb-6">
        Invite your friends to Growfly — they’ll get <b>20 free prompts</b> and you’ll earn <b>20 bonus prompts</b> for every signup.
      </p>

      <div className="bg-card p-6 rounded-xl shadow space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Your Referral Link:</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-2 rounded bg-background border border-gray-300"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => copyToClipboard(shareUrl)}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Referral Code:</h2>
          <div className="flex items-center space-x-2">
            <code className="bg-gray-100 px-3 py-1 rounded font-mono">{code || '—'}</code>
            <button
              onClick={() => code && copyToClipboard(code)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
