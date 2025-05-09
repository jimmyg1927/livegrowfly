'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();

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
      features: ['150 prompts/month', 'Priority AI speed', 'Prompt history'],
      button: 'Choose Personal',
      onClick: async () => {
        const res = await fetch('/api/checkout/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'personal' }),
        });
        const { url } = await res.json();
        window.location.href = url;
      },
    },
    {
      name: 'Business',
      price: '£38.99/month',
      features: ['500 prompts/month', '3 users', 'Team workspace', 'Priority support'],
      button: 'Choose Business',
      highlight: true,
      onClick: async () => {
        const res = await fetch('/api/checkout/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'business' }),
        });
        const { url } = await res.json();
        window.location.href = url;
      },
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited prompts', 'Unlimited users', 'Dedicated support'],
      button: 'Contact Us',
      onClick: () => router.push('/contact'),
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10 px-4">
      <Image src="/growfly-logo.png" alt="Growfly" width={140} height={40} className="mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
        Supercharge Your Output with Growfly
      </h1>
      <p className="text-md md:text-lg text-gray-200 mb-10 max-w-2xl text-center">
        Growfly uses cutting-edge AI to help professionals draft emails, reports, and presentations faster than ever. Pick a plan that fits your needs—and get started in seconds.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-300 ${
              plan.highlight ? 'border-2 border-blue-500 shadow-lg' : ''
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-semibold">
                Most Popular
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
              <p className="text-lg font-bold text-blue-300 mb-4">{plan.price}</p>
              <ul className="text-sm text-gray-200 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center">
                    <span className="mr-2 text-blue-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={plan.onClick}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
