'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    features: [
      '20 prompts/month',
      'Basic AI access',
      'Saved responses + Collab Zone',
    ],
    button: 'Use Free',
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99',
    features: [
      '400 prompts/month',
      'AI brand strategies',
      'Saved prompts + support',
    ],
    button: 'Change to Personal',
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99',
    features: [
      '2000 prompts/month',
      'Multi-user collaboration',
      'Advanced AI + analytics',
    ],
    highlight: true,
    button: 'Change to Business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited prompts + users',
      'Dedicated support',
      'Custom integrations',
    ],
    button: 'Contact Us',
  },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('growfly_jwt')
    if (!storedToken) {
      router.push('/login')
    } else {
      setToken(storedToken)
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.subscriptionType) {
            setCurrentPlan(data.subscriptionType.toLowerCase())
          }
        })
    }
  }, [router])

  const handleSelect = async (planId: string) => {
    setSelectedPlan(planId)
    setMessage('')

    if (planId === 'free') {
      router.push('/dashboard')
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0c0f1a] to-[#02050a] px-4 py-16 text-textPrimary">
      <div className="max-w-4xl text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">+ Change your Growfly plan +</h1>
        <p className="text-md text-gray-300">
          You&#39;re in control. Downgrade or upgrade any time. Paid plans unlock more prompts, speed, and tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col justify-between rounded-2xl border px-6 py-8 transition duration-300 ${
              plan.highlight
                ? 'bg-[#122c64] text-textPrimary border-[#2e63f5]'
                : 'bg-white text-black border-gray-200 hover:shadow-xl'
            }`}
          >
            <div>
              <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
              <p className="text-2xl font-bold mb-4">{plan.price}</p>
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <span className="mr-2">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={selectedPlan === plan.id || currentPlan === plan.id}
              className={`w-full mt-4 py-2 text-sm font-semibold rounded-md transition ${
                selectedPlan === plan.id || currentPlan === plan.id
                  ? 'bg-gray-400 cursor-not-allowed text-textPrimary'
                  : plan.highlight
                  ? 'bg-yellow-300 text-black hover:bg-yellow-200'
                  : 'bg-blue-600 text-textPrimary hover:bg-blue-700'
              }`}
            >
              {selectedPlan === plan.id
                ? 'Redirecting...'
                : currentPlan === plan.id
                ? 'Current Plan'
                : plan.button}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <p className="text-center text-sm mt-6 text-red-400 font-medium">{message}</p>
      )}
    </main>
  )
}
