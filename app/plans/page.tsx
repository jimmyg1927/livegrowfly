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
      price: '£0 / month',
      prompts: '20 prompts/month',
      users: '1 user',
      features: [
        'Access to Collab Zone',
        'Save & edit documents',
        'Upgrade anytime',
      ],
      buttonText: 'Use Free',
    },
    {
      id: 'personal',
      name: 'Personal',
      price: '£8.99 / month',
      prompts: '300 prompts/month',
      users: '1 user',
      features: [
        'Priority AI response speed',
        'Prompt history & saved replies',
        'Download responses',
      ],
      buttonText: 'Upgrade to Personal',
    },
    {
      id: 'business',
      name: 'Business',
      price: '£38.99 / month',
      prompts: '2000 prompts/month',
      users: '3 users',
      features: [
        'Shared team workspace',
        'Advanced collaboration tools',
        'High-speed AI processing',
        'Unlimited saved docs',
      ],
      buttonText: 'Most Popular',
      highlight: true,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session`, {
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
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0f172a] text-white py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-2">🧠 Upgrade Your Growfly Plan</h1>
      <p className="text-center text-gray-400 mb-10">Compare plans & unlock more power.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-6 shadow-lg border transition-all duration-300 flex flex-col justify-between ${
              plan.highlight
                ? 'bg-blue-600 text-white border-blue-400 scale-[1.02]'
                : 'bg-white text-black hover:ring-4 hover:ring-blue-500'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                ⭐ Most Popular
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
              <p className="text-lg font-semibold text-accent mb-3">{plan.price}</p>
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
              className={`mt-4 w-full py-2 rounded-xl font-semibold transition ${
                plan.highlight
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-blue-600 text-white hover:bg-blue-800'
              } ${loadingPlan === plan.id ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {loadingPlan === plan.id ? 'Redirecting...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
