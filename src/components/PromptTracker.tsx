'use client'

import React from 'react'

export default function PromptTracker({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100)

  return (
    <div className="w-48 bg-card p-4 rounded-xl shadow flex flex-col">
      <div className="flex justify-between text-sm mb-2">
        <span>Prompts This Month</span>
        <span>{used} / {limit}</span>
      </div>
      <div className="w-full bg-gray-700 h-2 rounded">
        <div className="bg-accent h-2 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
