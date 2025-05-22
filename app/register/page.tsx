'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

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
      button: 'Start Free',
      onClick: () => router.push('/onboarding?plan=free'),
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
      button: 'Choose Personal',
      onClick: () => router.push('/onboarding?plan=personal'),
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
      button: 'Choose Business',
      highlight: true,
      onClick: () => router.push('/onboarding?plan=business'),
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
      onClick: () => router.push('/contact'),
    },
  ]

  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] text-white">
      <div className="flex flex-col items-center text-center mb-10 mt-0">
        <Image src="/growfly-logo.png" alt="Growfly" width={140} height={40} className="mb-2" />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Supercharge Your Output with Growfly</h1>
        <p className="text-md md:text-lg text-white/80 max-w-2xl">
          Growfly is the ultimate distraction-free AI assistant — built to help entrepreneurs,
          business owners, and professionals scale faster. We streamline Marketing, Finance,
          HR, Legal, Product Feedback, Sales, and more. Supercharge your output, save time and
          money, and stay focused on what matters most.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl p-6 transition shadow-md ${
              plan.highlight
                ? 'bg-blue-600 text-white border border-blue-400'
                : 'bg-white text-black hover:ring-4 hover:ring-blue-300'
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
              onClick={plan.onClick}
              disabled={loadingPlan === plan.id}
              className={`w-full py-2 px-4 rounded font-medium text-sm transition ${
                plan.highlight
                  ? 'bg-yellow-300 text-black hover:bg-yellow-200'
                  : 'bg-[#1992FF] text-white hover:bg-blue-700'
              } ${loadingPlan === plan.id ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {loadingPlan === plan.id ? 'Redirecting...' : plan.button}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
