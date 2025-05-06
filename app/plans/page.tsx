'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PlansPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '£0/month',
      prompts: '5 prompts/month',
      users: '1 user',
      features: ['Basic AI support'],
      buttonText: 'Use Free',
    },
    {
      id: 'personal',
      name: 'Personal',
      price: '£8.99/month',
      prompts: '150 prompts/month',
      users: '1 user',
      features: ['Priority AI speed', 'Prompt history'],
      buttonText: 'Upgrade to Personal',
    },
    {
      id: 'business',
      name: 'Business',
      price: '£38.99/month',
      prompts: '500 prompts/month',
      users: '3 users',
      features: ['Team workspace', 'Unlimited prompts'],
      buttonText: 'Upgrade to Business',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      prompts: 'Unlimited',
      users: 'Unlimited',
      features: ['Dedicated support', 'Custom integrations'],
      buttonText: 'Contact Us',
    },
  ]

  const handleSelect = async (planId: string) => {
    setLoadingPlan(planId)

    if (planId === 'free') {
      router.push('/signup?plan=free')
      return
    }

    if (planId === 'enterprise') {
      router.push('/contact')
      return
    }

    try {
      const res = await fetch(`/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create Stripe session.')
      }
    } catch (err) {
      alert('Unexpected error creating Stripe session.')
      console.error(err)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-12">🚀 Manage Your Growfly Plan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white text-black rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:ring-4 hover:ring-blue-500 transition-all"
          >
            <div>
              <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
              <p className="text-lg font-semibold text-blue-700 mb-3">{plan.price}</p>
              <ul className="space-y-2 text-sm mb-4">
                <li>✔ {plan.prompts}</li>
                <li>✔ {plan.users}</li>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✔ {feature}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`mt-4 w-full py-2 rounded-xl text-white font-semibold ${
                loadingPlan === plan.id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-800 transition'
              }`}
            >
              {loadingPlan === plan.id ? 'Redirecting...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
