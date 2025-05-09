'use client';

import { useRouter } from 'next/navigation';

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
      features: ['150 prompts/month', 'Priority AI speed'],
      button: 'Choose Personal',
      onClick: async () => {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'personal' }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      },
    },
    {
      name: 'Business',
      price: '£38.99/month',
      features: ['500 prompts', '3 users', 'Team tools'],
      button: 'Choose Business',
      onClick: async () => {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: 'business' }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      },
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited prompts', 'Dedicated support'],
      button: 'Contact Us',
      onClick: () => router.push('/contact'),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f60ff] to-black text-white flex flex-col items-center justify-start py-16 px-4">
      <img src="/growfly-logo.png" alt="Growfly" className="w-32 mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Get Started with Growfly</h1>
      <p className="text-sm text-gray-300 mb-10">Pioneering AI helping professionals excel…</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:shadow-xl transition-all"
          >
            <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
            <p className="text-lg font-bold text-blue-300 mb-3">{plan.price}</p>
            <ul className="text-sm mb-6 text-gray-200 space-y-1">
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={plan.onClick}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl text-sm"
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
