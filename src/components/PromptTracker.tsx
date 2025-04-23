'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function PromptTracker({ used, limit }: { used: number; limit: number }) {
  const { theme } = useTheme();
  const percentage = Math.min((used / limit) * 100, 100);

  return (
    <div
      className={`p-4 rounded-2xl mb-6 shadow-md ${
        theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-[#161b22] text-white'
      }`}
    >
      <p className="text-sm font-medium mb-2">
        Prompts used: {used} / {limit}
      </p>
      <div className={`w-full rounded-full h-4 ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`}>
        <div
          className={`h-4 rounded-full ${
            percentage < 70
              ? 'bg-green-500'
              : percentage < 90
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
