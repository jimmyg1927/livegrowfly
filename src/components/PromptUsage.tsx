'use client';

import React from 'react';

interface PromptUsageProps {
  used: number;
  limit: number;
}

export default function PromptUsage({ used, limit }: PromptUsageProps) {
  const percentUsed = Math.min((used / limit) * 100, 100);

  return (
    <div className="bg-card text-textPrimary p-4 rounded-2xl shadow-smooth mb-6">
      <h2 className="text-lg font-bold mb-3">📈 Prompts Used This Month</h2>
      <p className="text-sm mb-2">
        You’ve used <strong>{used}</strong> out of <strong>{limit}</strong> prompts.
      </p>
      <div className="w-full bg-gray-700 rounded-lg h-4 overflow-hidden">
        <div
          className="bg-accent h-4 rounded-lg transition-all duration-500 ease-in-out"
          style={{ width: `${percentUsed}%` }}
        ></div>
      </div>
      {percentUsed >= 100 && (
        <p className="text-red-500 text-sm mt-2">
          🚫 You’ve hit your monthly limit. Upgrade your plan to unlock more prompts!
        </p>
      )}
    </div>
  );
}
