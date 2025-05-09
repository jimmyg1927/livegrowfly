'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/checkout/create-checkout-session', { planId });
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout redirect failed', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-2">Get Started with Growfly</h1>
        <p className="text-lg mb-10">Pioneering AI helping professionals excel...</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white text-black p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-bold">Free</h2>
            <p className="text-blue-600 text-lg font-semibold mt-2 mb-4">£0/month</p>
            <ul className="text-sm mb-4 space-y-1">
              <li>✔️ 20 prompts/month</li>
              <li>✔️ 1 user</li>
              <li>✔️ Access to Collab Zone</li>
              <li>✔️ Access Saved Responses</li>
              <li>✔️ Upgrade Later</li>
            </ul>
            <button
              onClick={() => router.push('/signup?plan=free')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Start Free
            </button>
          </div>

          {/* Personal Plan */}
          <div className="bg-white text-black p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-bold">Personal</h2>
            <p className="text-blue-600 text-lg font-semibold mt-2 mb-4">£8.99/month</p>
            <ul className="text-sm mb-4 space-y-1">
              <li>✔️ 300 prompts/month</li>
              <li>✔️ 1 user</li>
              <li>✔️ Priority AI Speed</li>
              <li>✔️ Prompt History</li>
              <li>✔️ Collab Zone + Saved Mode</li>
            </ul>
            <button
              onClick={() => handleSelectPlan('personal')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Choose Personal
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white text-black p-6 rounded-2xl shadow-md text-center border-2 border-blue-600 relative">
            <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-bl">
              Most Popular
            </span>
            <h2 className="text-xl font-bold">Business</h2>
            <p className="text-blue-600 text-lg font-semibold mt-2 mb-4">£49.99/month</p>
            <ul className="text-sm mb-4 space-y-1">
              <li>✔️ 2000 prompts/month</li>
              <li>✔️ 3 users</li>
              <li>✔️ Team Workspace</li>
              <li>✔️ All features unlocked</li>
              <li>✔️ Priority Support</li>
            </ul>
            <button
              onClick={() => handleSelectPlan('business')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Choose Business
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white text-black p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-bold">Enterprise</h2>
            <p className="text-blue-600 text-lg font-semibold mt-2 mb-4">Custom</p>
            <ul className="text-sm mb-4 space-y-1">
              <li>✔️ Unlimited prompts</li>
              <li>✔️ Unlimited users</li>
              <li>✔️ Dedicated support</li>
              <li>✔️ Custom integrations</li>
            </ul>
            <button
              onClick={() => router.push('/contact')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
