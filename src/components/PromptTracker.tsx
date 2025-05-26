// File: components/PromptTracker.tsx
'use client'

import React from 'react'

interface PromptTrackerProps {
  used: number
  limit: number
}

export default function PromptTracker({ used, limit }: PromptTrackerProps) {
  const pct = Math.min((used / limit) * 100, 100)
  const isFull = used >= limit

  return (
    <div className="flex flex-col text-xs font-medium text-foreground/80">
      {/* Title with emoji */}
      <div className="flex items-center gap-2">
        <span>⏱️ Prompts Used</span>
        <span className="text-foreground font-semibold">
          {used} / {limit}
        </span>
      </div>
      {/* Progress bar matching header style */}
      <div className="w-40 h-2 bg-white/30 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-500 ease-in-out ${
            isFull ? 'bg-red-500' : 'bg-white'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
