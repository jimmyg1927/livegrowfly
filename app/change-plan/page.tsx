'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0/month',
    description:
      '✓ 20 prompts/month\n✓ 1 user\n✓ Access to Collab Zone\n✓ Save & edit documents\n✓ Upgrade anytime',
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99/month',
    description:
      '✓ 400 prompts/month\n✓ 1 user\n✓ Priority AI speed\n✓ Prompt history\n✓ Download responses',
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99/month',
    description:
      '✓ 2000 prompts/month\n✓ 3 users\n✓ Team workspace\n✓ Priority support\n✓ Unlimited saved docs',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description:
      '✓ Unlimited prompts\n✓ Unlimited users\n✓ Dedicated support\n✓ Custom integrations',
    custom: true,
  },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  useEffect(() => {
    if (!token) router.push('/login')
  }, [token, router])

  const handlePlanChange = async () => {
    if (!selectedPlan) return setMessage('Please select a plan.')
    setLoading(true)

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      })

      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout session failed.')
      window.location.href = data.url
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-background text-textPrimary">
      <div className="max-w-7xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold">Upgrade Your Growfly Plan</h1>
        <p className="text-sm text-muted-foreground">Choose the plan that fits your workflow best.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => {
              if (plan.custom) return router.push('/contact')
              if (plan.id === 'free') return router.push('/signup?plan=free')
              setSelectedPlan(plan.id)
            }}
            className={`rounded-xl p-6 border transition cursor-pointer whitespace-pre-line shadow-sm
              ${selectedPlan === plan.id ? 'border-accent ring-2 ring-accent/30 scale-105' : 'border-border'}
              ${plan.highlight ? 'bg-accent text-white' : 'bg-card text-card-foreground'}
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.highlight && (
                <span className="bg-yellow-300 text-black text-xs font-bold px-2 py-1 rounded">
                  Most Popular
                </span>
              )}
            </div>
            <p className="text-sm font-semibold mb-2">{plan.price}</p>
            <p className="text-sm whitespace-pre-line">{plan.description}</p>
          </div>
        ))}
      </div>

      {selectedPlan && selectedPlan !== 'enterprise' && selectedPlan !== 'free' && (
        <div className="text-center mt-8">
          <button
            onClick={handlePlanChange}
            className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
            disabled={loading}
          >
            {loading ? 'Redirecting...' : 'Update Plan'}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-center text-red-500">{message}</p>
      )}
    </div>
  )
}
