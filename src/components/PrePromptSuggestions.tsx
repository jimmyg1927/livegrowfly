'use client';

import React from 'react';

interface PrePromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  "Give me a weekly content plan for Instagram.",
  "Write a catchy TikTok caption for a product launch.",
  "Suggest 5 viral marketing ideas for my clothing brand.",
  "How can I increase engagement on LinkedIn this week?",
  "Write an email subject line that boosts open rates.",
  "Generate a list of blog topics for my niche business.",
  "Suggest daily tasks to improve my social media presence.",
];

export default function PrePromptSuggestions({ onSelect }: PrePromptSuggestionsProps) {
  return (
    <div className="bg-card text-textPrimary p-4 rounded-2xl shadow-smooth mb-6">
      <h2 className="text-lg font-bold mb-3">🔥 Try These Daily Prompts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelect(prompt)}
            className="bg-accent text-background px-4 py-2 rounded-xl hover:bg-primary transition-colors duration-300 ease-in-out text-sm text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
