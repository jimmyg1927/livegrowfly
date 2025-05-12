'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()

  const plans = [
    {
      name: 'Free',
      price: '£0/month',
      features: ['20 prompts/month', '1 user', 'Access Saved Mode'],
      button: 'Start Free',
      onClick: () => router.push('/signup?plan=free'),
    },
    {
      name: 'Personal',
      price: '£8.99/month',
      features: ['400 prompts/month', 'Priority AI speed', 'Prompt history'],
      button: 'Choose Personal',
      onClick: async () => {
        const res = await fetch('/api/checkout/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'personal' }),
        })
        const { url } = await res.json()
        if (url) window.location.href = url
      },
    },
    {
      name: 'Business',
      price: '£38.99/month',
      features: [
        '2000 prompts/month',
        '3 users',
        'Team workspace',
        'Priority support',
      ],
      button: 'Choose Business',
      highlight: true,
      onClick: async () => {
        const res = await fetch('/api/checkout/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'business' }),
        })
        const { url } = await res.json()
        if (url) window.location.href = url
      },
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited prompts', 'Unlimited users', 'Dedicated support'],
      button: 'Contact Us',
      onClick: () => router.push('/contact'),
    },
  ]

  return (
    <main className="min-h-screen px-4 py-10 bg-background text-textPrimary">
      <div className="flex flex-col items-center text-center mb-10">
        <Image
          src="/growfly-logo.png"
          alt="Growfly"
          width={140}
          height={40}
          className="mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Supercharge Your Output with Growfly
        </h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl">
          Growfly uses cutting-edge AI to help professionals draft emails,
          reports, and presentations faster than ever. Pick a plan that fits
          your needs—and get started in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl p-6 transition shadow border text-card-foreground ${
              plan.highlight
                ? 'border-accent ring-2 ring-accent/30 bg-accent text-accent-foreground'
                : 'bg-card border-border'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 right-3 bg-yellow-300 text-black text-xs px-2 py-1 rounded font-semibold">
                Most Popular
              </div>
            )}
            <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
            <p className="text-lg font-bold mb-4">{plan.price}</p>
            <ul className="text-sm space-y-2 mb-6 whitespace-pre-line">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start">
                  <span className="mr-2 text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={plan.onClick}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-2 px-4 rounded text-sm font-medium transition"
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
