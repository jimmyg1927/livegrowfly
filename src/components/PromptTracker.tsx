'use client';

import React from 'react';

export default function PromptTracker({ used, limit }: { used: number; limit: number }) {
  const progress = Math.min((used / limit) * 100, 100);

  return (
    <div className="bg-card text-textPrimary p-4 rounded-xl shadow-smooth mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold">Prompts Used This Month</p>
        <p className="text-sm">
          {used} / {limit}
        </p>
      </div>
      <div className="w-full bg-gray-700 rounded h-2">
        <div className="bg-accent h-2 rounded" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
