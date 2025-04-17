'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  function handlePlanSelect(plan: string) {
    sessionStorage.setItem('selectedPlan', plan);
    router.push('/signup');
  }

  const plans = [
    {
      name: 'Free',
      price: '£0/month',
      features: ['5 prompts/month', '1 user', 'Basic AI support'],
      id: 'free',
    },
    {
      name: 'Personal',
      price: '£8.99/month',
      features: ['50 prompts/month', '1 user', 'Priority AI speed'],
      id: 'personal',
    },
    {
      name: 'Entrepreneur',
      price: '£16.99/month',
      features: [
        '250 prompts/month',
        '1 user',
        'Prompt saving',
        'AI feedback',
        'Early feature access',
      ],
      id: 'entrepreneur',
      highlight: true, // 🔥 Highlight this plan
    },
    {
      name: 'Business',
      price: '£49.99/month',
      features: ['1200 prompts/month', '3 users', 'Team dashboard', 'Prompt analytics'],
      id: 'business',
    },
  ];

  return (
    <div className="min-h-screen bg-[#2daaff] text-white px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-10">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white text-black rounded-2xl p-6 shadow-lg flex flex-col items-center transition transform hover:scale-105 ${
              plan.highlight ? 'border-4 border-[#2daaff] shadow-blue-300' : ''
            }`}
          >
            {plan.highlight && (
              <div className="text-xs font-semibold uppercase bg-[#2daaff] text-white px-3 py-1 rounded-full mb-2">
                Recommended
              </div>
            )}
            <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
            <p className="text-2xl font-semibold mb-4">{plan.price}</p>
            <ul className="mb-6 text-sm space-y-2 text-left">
              {plan.features.map((feat, idx) => (
                <li key={idx}>✅ {feat}</li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect(plan.id)}
              className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
