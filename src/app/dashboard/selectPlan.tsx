import React from 'react';
'use client';

import { useRouter } from 'next/navigation';

export default function SelectPlan() {
  const router = useRouter();

  function handleSelectPlan(plan: string) {
    // Set the selected plan (for now, this is just a UI update)
    sessionStorage.setItem('selectedPlan', plan);

    // Redirect to Shopify billing page (using Shopify API)
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
