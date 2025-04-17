'use client';

import React from 'react';

export default function PromptTracker({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <p className="text-sm text-gray-800 font-medium">
        Prompts used: {used} / {limit}
      </p>
      <div className="w-full bg-gray-300 rounded h-2 mt-2">
        <div
          className="bg-blue-600 h-2 rounded"
          style={{ width: `${(used / limit) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
