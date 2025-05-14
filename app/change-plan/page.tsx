'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0/month',
    description: [
      '20 prompts/month',
      '1 user',
      'Access to Collab Zone',
      'Save & edit documents',
      'Upgrade anytime',
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99/month',
    description: [
      '400 prompts/month',
      '1 user',
      'Priority AI speed',
      'Prompt history',
      'Download responses',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99/month',
    description: [
      '2000 prompts/month',
      '3 users',
      'Team workspace',
      'Priority support',
      'Unlimited saved docs',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: [
      'Unlimited prompts',
      'Unlimited users',
      'Dedicated support',
      'Custom integrations',
    ],
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

  const handleSelect = async (planId: string) => {
    setSelectedPlan(planId)

    if (planId === 'free') {
      router.push('/signup?plan=free')
      return
    }

    if (planId === 'enterprise') {
      router.push('/contact')
      return
    }

    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        setMessage(data.error || 'Failed to redirect.')
      }
    } catch (err) {
      console.error(err)
      setMessage('Unexpected error creating Stripe session.')
    }
  }

  return (
    <main className="min-h-screen bg-background text-textPrimary px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Change Your Growfly Plan</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Select the plan that best fits your workflow and upgrade instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl p-6 transition shadow-md border text-sm ${
              plan.popular
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-card text-card-foreground border-border hover:ring-4 hover:ring-blue-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                Most Popular
              </div>
            )}
            <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
            <p className="text-lg font-bold mb-4">{plan.price}</p>
            <ul className="mb-6 space-y-2">
              {plan.description.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={selectedPlan === plan.id}
              className={`w-full py-2 px-4 rounded font-semibold transition text-sm ${
                plan.popular
                  ? 'bg-yellow-300 text-black hover:bg-yellow-200'
                  : 'bg-accent text-white hover:bg-accent/90'
              } ${selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {plan.custom
                ? 'Contact Us'
                : selectedPlan === plan.id
                ? 'Redirecting...'
                : 'Change Plan'}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <p className="text-center text-sm mt-6 text-red-500 font-medium">{message}</p>
      )}
    </main>
  )
}
