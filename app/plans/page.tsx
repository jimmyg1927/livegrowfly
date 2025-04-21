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
      price: '£0/month',
      prompts: '5 prompts/month',
      users: '1 user',
      features: ['Basic AI support'],
      buttonText: 'Select Plan',
    },
    {
      id: 'personal',
      name: 'Personal',
      price: '£8.99/month',
      prompts: '150 prompts/month',
      users: '1 user',
      features: ['Priority AI speed', 'Prompt history access'],
      buttonText: 'Select Personal',
    },
    {
      id: 'business',
      name: 'Business',
      price: '£38.99/month',
      prompts: '500 prompts/month',
      users: '3 users',
      features: ['Brand workspace', 'Unlimited AI access'],
      buttonText: 'Select Business',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom pricing',
      prompts: 'Unlimited prompts',
      users: 'Unlimited users',
      features: ['Dedicated support', 'Custom features'],
      buttonText: 'Contact Us',
    },
  ];

  const handleSelect = async (planId: string) => {
    if (planId === 'enterprise') {
      router.push('/contact');
    } else {
      setLoading(true);
      try {
        const userEmail = prompt('Enter your email to continue:');
        const userName = prompt('Enter your name:');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, plan: planId, name: userName }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Failed to create Stripe session.');
        }
      } catch (err) {
        alert('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-300 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">✨ Choose Your Growfly Plan ✨</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white text-black rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transition"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-lg font-semibold text-blue-700 mb-4">{plan.price}</p>
              <ul className="space-y-2">
                <li>✔ {plan.prompts}</li>
                <li>✔ {plan.users}</li>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✔ {feature}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={loading}
              className="mt-6 bg-blue-600 text-white w-full py-2 rounded-xl hover:bg-blue-800 transition"
            >
              {loading ? 'Loading...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
