'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0/month',
    features: [
      '20 prompts/month',
      '1 user',
      'Access Saved Mode',
      'Upgrade anytime',
    ],
    button: 'Use Free',
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99/month',
    features: [
      '400 prompts/month',
      'Priority AI speed',
      'Prompt history',
      'Download responses',
    ],
    button: 'Change to Personal',
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99/month',
    features: [
      '2000 prompts/month',
      '3 users',
      'Team workspace',
      'Priority support',
      'Unlimited saved docs',
    ],
    button: 'Change to Business',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited prompts',
      'Unlimited users',
      'Dedicated support',
      'Custom integrations',
    ],
    button: 'Contact Us',
  },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')

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

    const token = localStorage.getItem('growfly_jwt')
    if (!token) {
      setMessage('You must be logged in to change your plan.')
      return
    }

    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        setMessage(data.error || 'Failed to redirect.')
        setSelectedPlan(null)
      }
    } catch (err) {
      console.error(err)
      setMessage('Unexpected error creating Stripe session.')
      setSelectedPlan(null)
    }
  }

  return (
    <main className="min-h-screen bg-background text-textPrimary px-6 py-16">
      <div className="flex flex-col items-center text-center mb-10">
        <Image
          src="/growfly-logo.png"
          alt="Growfly"
          width={140}
          height={40}
          className="mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Change Your Growfly Plan
        </h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl">
          Upgrade or downgrade your subscription plan anytime. Paid plans provide more prompts, team access, and enhanced tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl p-6 transition shadow-md border text-black flex flex-col justify-between ${
              plan.highlight
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-white border-border hover:ring-4 hover:ring-blue-300'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                Most Popular
              </div>
            )}
            <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
            <p className="text-lg font-bold mb-4">{plan.price}</p>
            <ul className="text-sm space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={selectedPlan === plan.id}
              className={`w-full py-2 px-4 rounded font-medium text-sm transition ${
                plan.highlight
                  ? 'bg-yellow-300 text-black hover:bg-yellow-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${selectedPlan === plan.id ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {selectedPlan === plan.id ? 'Redirecting...' : plan.button}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <p className="text-center text-red-500 font-medium text-sm mt-6">{message}</p>
      )}
    </main>
  )
}
