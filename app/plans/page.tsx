'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Free',
      prompts: '5 prompts/month',
      users: '1 user',
      benefits: ['Basic AI support'],
      isEnterprise: false,
    },
    {
      id: 'personal',
      name: 'Personal',
      price: '£8.99/month',
      prompts: '150 prompts/month',
      users: '1 user',
      benefits: ['Priority AI speed', 'Prompt history access'],
      isEnterprise: false,
    },
    {
      id: 'business',
      name: 'Business',
      price: '£38.99/month',
      prompts: '500 prompts/month',
      users: '3 users',
      benefits: ['Brand workspace', 'Unlimited AI speed', 'Collaboration tools'],
      isEnterprise: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom pricing',
      prompts: 'Unlimited prompts',
      users: 'Unlimited users',
      benefits: [
        'Dedicated AI analyst',
        'White-glove onboarding',
        'SLAs + Enterprise compliance',
      ],
      isEnterprise: true,
    },
  ];

  const handleSelect = async (planId: string) => {
    setLoading(true);
    if (planId === 'enterprise') {
      router.push('/contact');
      return;
    }

    const email = localStorage.getItem('email') || prompt('Enter your email to continue:');
    const name = localStorage.getItem('name') || prompt('Enter your name:');
    if (!email || !name) {
      alert('Name and email are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId, email, name }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Stripe error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] to-[#001F3F] text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-12">✨ Choose Your Growfly Plan ✨</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white text-black rounded-2xl p-6 shadow-xl transform transition hover:scale-105 flex flex-col justify-between border-4 ${
              plan.id === 'business' ? 'border-yellow-500' :
              plan.id === 'entrepreneur' ? 'border-green-500' :
              plan.id === 'enterprise' ? 'border-purple-600' :
              'border-transparent'
            }`}
          >
            <div>
              <h2 className="text-2xl font-extrabold mb-2">{plan.name}</h2>
              <p className="text-lg font-semibold text-gray-700 mb-4">{plan.price}</p>
              <ul className="text-sm text-gray-800 mb-4 space-y-2">
                <li>✔ {plan.prompts}</li>
                <li>✔ {plan.users}</li>
                {plan.benefits.map((b, i) => (
                  <li key={i}>✔ {b}</li>
                ))}
              </ul>
            </div>
            <button
              disabled={loading}
              onClick={() => handleSelect(plan.id)}
              className="mt-auto w-full bg-[#2daaff] text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              {plan.isEnterprise ? 'Contact Us' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
