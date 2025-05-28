'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()

  const handleSelect = (plan: string) => {
    if (plan === 'enterprise') {
      router.push('/contact?plan=enterprise')
    } else {
      router.push(`/onboarding?plan=${plan}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] px-4 pt-4 pb-6 text-textPrimary">
      <div className="flex justify-center mb-2 mt-2">
        <Image src="/growfly-logo.png" alt="Growfly Logo" width={150} height={50} />
      </div>

      +<h1 className="text-3xl font-bold text-center mb-4">
      +  Focus on your business
      +</h1>
      <p className="text-center text-textPrimary/80 max-w-xl mx-auto mb-10">
        AI for business, no distraction. Pick a plan to get started. You can upgrade anytime. No credit card needed for free accounts.
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-md flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2">Free</h2>
          <p className="text-textPrimary/70 text-sm mb-4">Explore Growfly and try basic features.</p>
          <p className="text-3xl font-bold mb-4">£0</p>
          <ul className="text-sm text-textPrimary/80 space-y-2 mb-4">
            <li>✅ 20 free prompts per month</li>
            <li>✅ Unique and detailed AI responses</li>
            <li>✅ Access to Saved + Collab</li>
          </ul>
          <button
            onClick={() => handleSelect('free')}
            className="mt-auto px-4 py-2 bg-[#72C8F6] text-textPrimary font-semibold rounded-full hover:brightness-110 transition"
          >
            Start Free
          </button>
        </div>

        {/* Personal Plan */}
        <div className="rounded-2xl border-2 border-[#72C8F6] bg-white/10 p-6 shadow-lg flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2 text-[#72C8F6]">Personal</h2>
          <p className="text-textPrimary/70 text-sm mb-4">For individual creators + founders.</p>
          <p className="text-3xl font-bold mb-4">£8.99</p>
          <ul className="text-sm text-textPrimary/80 space-y-2 mb-4">
            <li>🚀 400 prompts a month</li>
            <li>✅ Unique AI-generated responses</li>
            <li>✅ Saved prompts, Collab docs, support and more</li>
          </ul>
          <button
            onClick={() => handleSelect('personal')}
            className="mt-auto px-4 py-2 bg-[#72C8F6] text-textPrimary font-semibold rounded-full hover:brightness-110 transition"
          >
            Choose Personal
          </button>
        </div>

        {/* Business Plan */}
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-md flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2">Business</h2>
          <p className="text-textPrimary/70 text-sm mb-4">Best for teams & growing brands.</p>
          <p className="text-3xl font-bold mb-4">£38.99</p>
          <ul className="text-sm text-textPrimary/80 space-y-2 mb-4">
            <li>👥 2000 prompts a month</li>
            <li>✅ Multi-user collaboration</li>
            <li>✅ Advanced AI, insights, analytics, support </li>
          </ul>
          <button
            onClick={() => handleSelect('business')}
            className="mt-auto px-4 py-2 bg-[#72C8F6] text-textPrimary font-semibold rounded-full hover:brightness-110 transition"
          >
            Choose Business
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-textPrimary/60 mt-8">
        Want something custom?{' '}
        <Link href="/contact?plan=enterprise" className="underline hover:text-[#72C8F6]">
          Contact us
        </Link>{' '}
        for Enterprise plans.
      </p>
    </main>
  )
}