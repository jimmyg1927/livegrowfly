'use client';

import React from 'react';

const missions = [
  "💡 Review and optimise your Instagram bio.",
  "🎯 Post one piece of educational content on LinkedIn.",
  "📸 Share a behind-the-scenes story on Instagram.",
  "💌 Write and schedule your next email campaign.",
  "🧲 Plan your TikTok content for the week.",
];

export default function TodaysMission() {
  const randomMission = missions[Math.floor(Math.random() * missions.length)];

  return (
    <div className="bg-card text-textPrimary p-4 rounded-2xl shadow-smooth mb-6">
      <h2 className="text-lg font-bold mb-3">🚀 Today’s Mission</h2>
      <p className="text-base">{randomMission}</p>
    </div>
  );
}
