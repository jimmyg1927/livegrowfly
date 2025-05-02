'use client'

import React from 'react'

const suggestions = [
  '📊 Give me a social media plan for this week',
  '🎯 Suggest a TikTok strategy for my brand',
  '📝 Write me a Facebook ad copy for a product launch',
  '📅 Generate a daily content calendar for Instagram',
  '💡 Give me 5 growth hacks for my Shopify store',
]

export default function PrePromptSuggestions({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="w-full mb-3">
      <h3 className="text-xs font-medium text-foreground/80 mb-2 ml-1">✨ Try a suggested prompt:</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.replace(/^[^a-zA-Z]+/, ''))}
            className="text-xs px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
