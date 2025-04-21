'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0/month',
    features: ['5 prompts/month', '1 user', 'Basic AI support'],
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99/month',
    features: ['50 prompts/month', '1 user', 'Priority AI speed'],
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
  },
];

export default function ChangePlanPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setCurrentPlan(data.subscriptionType);
      } catch (err) {
        console.error('Failed to load user plan', err);
      }
    };

    if (token) fetchUserPlan();
  }, [token]);

  const handlePlanChange = async (planId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2daaff] text-white px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Update Your Plan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white text-black rounded-2xl p-6 shadow-md flex flex-col justify-between ${
              currentPlan === plan.id ? 'border-4 border-green-500' : ''
            }`}
          >
            <div>
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
            </div>
            <button
              onClick={() => handlePlanChange(plan.id)}
              className={`mt-auto w-full py-2 px-4 rounded ${
                currentPlan === plan.id
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              disabled={loading || currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : loading ? 'Redirecting...' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
