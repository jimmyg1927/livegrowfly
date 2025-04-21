'use client';

import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '£0/month',
      features: ['5 prompts/month', '1 user', 'Basic AI support'],
      recommended: false,
    },
    {
      id: 'personal',
      name: 'Personal',
      price: '£8.99/month',
      features: ['50 prompts/month', '1 user', 'Priority AI speed'],
      recommended: false,
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneur',
      price: '£16.99/month',
      features: [
        '250 prompts/month',
        '1 user',
        'Prompt saving',
        'AI feedback',
        'Early feature access',
      ],
      recommended: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: '£49.99/month',
      features: [
        '1200 prompts/month',
        '3 users',
        'Brand assets',
        'Unlimited AI access',
        'Team workspace',
      ],
      recommended: false,
    },
  ];

  const handleSelect = async (planId: string) => {
    if (planId === 'free') {
      router.push(`/signup?plan=free`);
    } else {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Something went wrong.');

        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (err: any) {
        alert(err.message || 'Failed to redirect to Stripe');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#2daaff] text-white px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white text-black rounded-2xl p-6 shadow-md flex flex-col items-start justify-between ${
              plan.recommended ? 'border-4 border-blue-500 scale-105' : ''
            }`}
          >
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-lg mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.recommended && (
                <p className="text-xs text-blue-600 font-semibold uppercase mb-2">
                  Recommended
                </p>
              )}
            </div>
            <button
              onClick={() => handleSelect(plan.id)}
              className="mt-auto w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
