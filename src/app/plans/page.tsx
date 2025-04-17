'use client';

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
      price: '£0',
      features: ['5 prompts/month', '1 user', 'Basic AI support'],
      id: 'free',
    },
    {
      name: 'Personal',
      price: '£8.99',
      features: ['50 prompts/month', '1 user', 'Priority AI speed'],
      id: 'personal',
    },
    {
      name: 'Entrepreneur',
      price: '£16.99',
      features: ['250 prompts/month', '1 user', 'Prompt saving & AI feedback'],
      id: 'entrepreneur',
    },
    {
      name: 'Business',
      price: '£49.99',
      features: ['1200 prompts/month', '3 users', 'Team dashboard', 'Prompt analytics'],
      id: 'business',
    },
  ];

  return (
    <div className="min-h-screen bg-[#2daaff] text-white px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white text-black p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <p className="text-2xl font-semibold mb-4">{plan.price}</p>
            <ul className="mb-6 text-sm space-y-2">
              {plan.features.map((feat, idx) => (
                <li key={idx}>✅ {feat}</li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect(plan.id)}
              className="bg-black text-white px-4 py-2 rounded hover:scale-105 transition"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
