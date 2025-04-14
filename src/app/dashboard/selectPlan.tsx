'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SelectPlan() {
  const router = useRouter();

  function handleSelectPlan(plan: string) {
    // Save selected plan (you can later send this to the backend if needed)
    sessionStorage.setItem('selectedPlan', plan);

    // Redirect to Shopify billing with plan as a query param
    router.push(`/shopify/billing?plan=${plan}`);
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-10 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Select Your Plan</h2>
      <div className="space-y-4">
        <button
          onClick={() => handleSelectPlan('free')}
          className="w-full p-2 bg-gray-200 rounded"
        >
          Free Plan
        </button>
        <button
          onClick={() => handleSelectPlan('paid')}
          className="w-full p-2 bg-black text-white rounded"
        >
          Paid Plan
        </button>
      </div>
    </div>
  );
}
