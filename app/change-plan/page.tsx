'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0/month',
    features: [
      '20 prompts/month',
      '1 user',
      'Access to Collab Zone',
      'Save & edit documents',
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
      '1 user',
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
    highlight: true,
    button: 'Change to Business',
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
  const [message, setMessage] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  useEffect(() => {
    if (!token) router.push('/login')
  }, [token, router])

  const handleSelect = async (planId: string) => {
    setSelectedPlan(planId)
    setMessage('')

    if (planId === 'free') {
      router.push('/signup?plan=free')
      return
    }

    if (planId === 'enterprise') {
      router.push('/contact')
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/change-plan`, {
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
        setSelectedPlan(null)
      }
    } catch (err) {
      console.error(err)
      setMessage('Unexpected error creating Stripe session.')
      setSelectedPlan(null)
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 bg-background text-textPrimary">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Change Your Growfly Plan</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Upgrade or downgrade your subscription plan anytime. Paid plans provide more prompts,
          team access, and enhanced tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl p-6 transition shadow-md border flex flex-col justify-between ${
              plan.highlight
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-white text-black border-gray-200 hover:ring-4 hover:ring-blue-200'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                Most Popular
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
              <p className="text-lg font-semibold mb-4">{plan.price}</p>
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((line) => (
                  <li key={line}>✓ {line}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={selectedPlan === plan.id}
              className={`mt-auto w-full py-2 px-4 rounded-md text-sm font-semibold transition ${
                plan.highlight
                  ? 'bg-yellow-300 text-black hover:bg-yellow-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {selectedPlan === plan.id ? 'Redirecting...' : plan.button}
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
