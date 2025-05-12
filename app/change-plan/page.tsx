'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Free',
    description:
      '✓ 20 prompts/month\n✓ 1 user\n✓ Access to Collab Zone\n✓ Save & edit documents\n✓ Upgrade anytime',
  },
  {
    id: 'personal',
    name: 'Personal',
    description:
      '✓ 300 prompts/month\n✓ 1 user\n✓ Priority AI response speed\n✓ Prompt history & saved replies\n✓ Download responses',
  },
  {
    id: 'business',
    name: 'Business',
    description:
      '✓ 2000 prompts/month\n✓ 3 users\n✓ Shared team workspace\n✓ Advanced collaboration tools\n✓ High-speed AI processing\n✓ Unlimited saved docs',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description:
      '✓ Unlimited\n✓ Dedicated support\n✓ Custom integrations\n✓ Team onboarding',
    custom: true,
  },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [message, setMessage] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  useEffect(() => {
    if (!token) router.push('/login')
  }, [token, router])

  const handlePlanChange = async () => {
    if (!selectedPlan) return setMessage('Please select a plan.')

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: selectedPlan }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Checkout session failed.')
      }

      window.location.href = data.url
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-background text-textPrimary">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Growfly Plan</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Compare plans & unlock more power.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`rounded-xl p-6 border shadow transition cursor-pointer whitespace-pre-line
              ${
                selectedPlan === plan.id
                  ? 'border-accent ring-2 ring-accent/30 scale-105'
                  : 'border-border'
              }
              ${
                plan.popular
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card text-card-foreground'
              }
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.popular && (
                <span className="bg-yellow-300 text-black text-xs font-bold px-2 py-1 rounded">
                  Most Popular
                </span>
              )}
            </div>
            <p className="text-sm whitespace-pre-line">{plan.description}</p>

            {plan.custom && (
              <button
                onClick={() => router.push('/contact')}
                className="mt-4 w-full bg-accent hover:bg-accent/90 text-accent-foreground py-2 px-4 rounded text-sm font-medium"
              >
                Contact Us
              </button>
            )}
          </div>
        ))}
      </div>

      {!plans.find((p) => p.id === selectedPlan)?.custom && (
        <div className="text-center mt-8">
          <button
            onClick={handlePlanChange}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2 rounded text-sm font-medium transition"
          >
            Update Plan
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-center text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
