'use client';

import React from 'react';

const suggestions = [
  '📊 Give me a social media plan for this week',
  '🎯 Suggest a TikTok strategy for my brand',
  '📝 Write me a Facebook ad copy for a product launch',
  '📅 Generate a daily content calendar for Instagram',
  '💡 Give me 5 growth hacks for my Shopify store',
];

export default function PrePromptSuggestions({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="bg-card text-textPrimary p-4 rounded-xl shadow-smooth mb-6">
      <h3 className="text-sm font-semibold mb-3">✨ Need inspiration? Try one of these prompts:</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.replace(/^[^a-zA-Z]+/, ''))}
            className="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
