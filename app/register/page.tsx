'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    description: '5 prompts/month',
    button: 'Start Free',
    href: '/signup?plan=free',
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99/mo',
    description: '150 prompts/month',
    button: 'Choose Personal',
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99/mo',
    description: '500 prompts + 3 users',
    button: 'Choose Business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Unlimited prompts, team tools',
    button: 'Contact Us',
    href: '/contact',
  },
]

export default function RegisterPage() {
  const router = useRouter()

  const handlePaidPlan = async (planId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } catch (err) {
      console.error(err)
      alert('Error starting checkout session.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Choose your Growfly plan</h1>
        <p className="text-lg text-muted mb-12">
          Select the plan that best suits your business. Free for personal use. Paid plans unlock more prompts and features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-xl p-6 shadow-md bg-card">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-xl mb-1">{plan.price}</p>
              <p className="text-sm text-muted mb-6">{plan.description}</p>
              {plan.href ? (
                <a
                  href={plan.href}
                  className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                >
                  {plan.button}
                </a>
              ) : (
                <button
                  onClick={() => handlePaidPlan(plan.id)}
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                >
                  {plan.button}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
