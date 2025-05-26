'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const handlePlanSelect = (plan: string) => {
    router.push(`/onboarding?plan=${plan}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] px-4 py-10 text-white flex flex-col items-center">
      <Image
        src="/growfly-logo.png"
        alt="Growfly Logo"
        width={160}
        height={40}
        className="mb-6"
      />

      <h1 className="text-3xl font-bold text-center mb-3">Choose your Growfly plan</h1>
      <p className="text-center text-white/80 mb-10 max-w-md">
        Whether you're just curious or scaling your business, Growfly's AI can help you save time, spark ideas, and stay ahead.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {/* Free Plan */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-1">Free</h2>
          <p className="text-sm text-white/80 mb-4">20 prompts/month</p>
          <ul className="text-sm text-white/70 mb-6 space-y-1">
            <li>✅ Try AI with no cost</li>
            <li>✅ Access dashboard</li>
            <li>✅ Upgrade anytime</li>
          </ul>
          <button
            onClick={() => handlePlanSelect('free')}
            className="w-full bg-[#72C8F6] text-black font-semibold py-2 rounded-full hover:brightness-110 transition"
          >
            Choose Free
          </button>
        </div>

        {/* Personal Plan */}
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-1">Personal</h2>
          <p className="text-sm text-white/80 mb-4">400 prompts/month – £9.99</p>
          <ul className="text-sm text-white/70 mb-6 space-y-1">
            <li>🚀 Advanced AI access</li>
            <li>🔓 Unlock Saved & Collab tools</li>
            <li>📈 Personal brand insights</li>
          </ul>
          <button
            onClick={() => handlePlanSelect('personal')}
            className="w-full bg-[#72C8F6] text-black font-semibold py-2 rounded-full hover:brightness-110 transition"
          >
            Choose Personal
          </button>
        </div>

        {/* Business Plan */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-1">Business</h2>
          <p className="text-sm text-white/80 mb-4">2000 prompts/month – £38.99</p>
          <ul className="text-sm text-white/70 mb-6 space-y-1">
            <li>🏢 Full AI suite for teams</li>
            <li>👥 Add teammates & share</li>
            <li>📊 Admin tools & analytics</li>
          </ul>
          <button
            onClick={() => handlePlanSelect('business')}
            className="w-full bg-[#72C8F6] text-black font-semibold py-2 rounded-full hover:brightness-110 transition"
          >
            Choose Business
          </button>
        </div>
      </div>

      <p className="text-white/60 text-sm mt-8">
        Want something custom?{' '}
        <Link href="/contact" className="underline hover:text-[#72C8F6]">
          Contact us
        </Link>
      </p>
    </main>
  )
}