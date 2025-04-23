'use client';

import React from 'react';

const tips = [
  {
    title: "🎨 Improve Your Brand Voice",
    description: "Use consistent language across your posts. Define your tone—fun, educational, or inspirational?",
  },
  {
    title: "📊 Use Data to Guide You",
    description: "Analyze which posts are performing best. Double down on what works and experiment with new formats.",
  },
  {
    title: "📅 Stay Consistent",
    description: "Plan your content in advance using a calendar. Consistency builds trust with your audience.",
  },
  {
    title: "📸 Use High-Quality Visuals",
    description: "Visuals catch attention fast. Make sure your posts are clean, bright, and on-brand.",
  },
  {
    title: "💡 Engage with Your Community",
    description: "Reply to comments and DMs. Ask your audience questions to boost engagement.",
  },
];

export default function BoostMyResults() {
  return (
    <div className="bg-card text-textPrimary p-4 rounded-2xl shadow-smooth mb-6">
      <h2 className="text-lg font-bold mb-4">📈 Boost My Results</h2>
      <ul className="space-y-4">
        {tips.map((tip, index) => (
          <li key={index} className="border-l-4 border-accent pl-4">
            <h3 className="text-md font-semibold">{tip.title}</h3>
            <p className="text-sm text-textSecondary">{tip.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
