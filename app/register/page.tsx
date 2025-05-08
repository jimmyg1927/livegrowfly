// File: app/register/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '£0/month',
      perks: [
        '20 prompts/month',
        '1 user',
        'Access to Collab Zone',
        'Access Saved Responses',
        'Upgrade Later'
      ],
      buttonText: 'Start Free',
    },
    {
      id: 'personal',
      name: 'Personal',
      price: '£8.99/month',
      perks: [
        '300 prompts/month',
        '1 user',
        'Priority AI Speed',
        'Prompt History',
        'Collab Zone + Saved Mode'
      ],
      buttonText: 'Choose Personal',
    },
    {
      id: 'business',
      name: 'Business',
      price: '£49.99/month',
      perks: [
        '2000 prompts/month',
        '3 users',
        'Team Workspace',
        'All features unlocked',
        'Priority Support'
      ],
      buttonText: 'Choose Business',
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      perks: [
        'Unlimited prompts',
        'Unlimited users',
        'Dedicated support',
        'Custom integrations'
      ],
      buttonText: 'Contact Us',
    }
  ]

  const handleSelect = async (planId: string) => {
    setLoadingPlan(planId)

    if (planId === 'free') {
      return router.push('/signup?plan=free')
    }
    if (planId === 'enterprise') {
      return router.push('/contact')
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to redirect to Stripe.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#007aff] to-[#001f3f] text-white p-6">
      <div className="flex justify-center mb-6">
        <Image src="/growfly-logo.png" alt="Growfly" width={160} height={40} />
      </div>

      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold">Get Started with Growfly</h1>
        <p className="text-blue-100 text-lg mt-2">Pioneering AI helping professionals excel...</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-10">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white text-black rounded-2xl shadow-lg p-6 flex flex-col justify-between transition hover:ring-4 hover:ring-blue-400 ${plan.highlight ? 'border-4 border-blue-500' : ''}`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-xl font-bold">Most Popular</div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
              <p className="text-lg font-semibold text-blue-700 mb-3">{plan.price}</p>
              <ul className="text-sm space-y-2">
                {plan.perks.map((perk, idx) => (
                  <li key={idx}>✔ {perk}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelect(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`mt-4 w-full py-2 rounded-xl text-white font-semibold ${
                loadingPlan === plan.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800 transition'
              }`}
            >
              {loadingPlan === plan.id ? 'Loading...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
