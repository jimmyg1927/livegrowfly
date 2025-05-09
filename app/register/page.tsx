'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const handleSelectPlan = async (planId: string) => {
    try {
      const res = await fetch('/api/checkout/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to redirect to checkout.')
      }
    } catch (err) {
      alert('Checkout error')
    }
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary py-16 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4">Choose your Growfly plan</h1>
      <p className="text-lg mb-10 text-center max-w-xl">
        Select the plan that best suits your business. Free for personal use. Paid plans unlock more prompts and features.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-card p-6 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-semibold">Free</h2>
          <p className="text-xl my-2">£0</p>
          <p className="text-sm mb-4">5 prompts/month</p>
          <button
            onClick={() => router.push('/signup?plan=free')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Free
          </button>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-semibold">Personal</h2>
          <p className="text-xl my-2">£8.99/mo</p>
          <p className="text-sm mb-4">150 prompts/month</p>
          <button
            onClick={() => handleSelectPlan('personal')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Choose Personal
          </button>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-semibold">Business</h2>
          <p className="text-xl my-2">£38.99/mo</p>
          <p className="text-sm mb-4">500 prompts + 3 users</p>
          <button
            onClick={() => handleSelectPlan('business')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Choose Business
          </button>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-semibold">Enterprise</h2>
          <p className="text-xl my-2">Custom</p>
          <p className="text-sm mb-4">Unlimited prompts, team tools</p>
          <button
            onClick={() => router.push('/contact')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}
