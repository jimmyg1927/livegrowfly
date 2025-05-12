'use client'

import React from 'react'

export default function PromptTracker({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100)
  const isFull = used >= limit

  return (
    <div className="flex flex-col text-xs font-medium text-foreground/80">
      <div className="flex items-center gap-2">
        <span>Prompts Used</span>
        <span className="text-foreground font-semibold">{used} / {limit}</span>
      </div>
      <div className="w-40 h-2 rounded-full bg-border overflow-hidden mt-1">
        <div
          className={`h-full ${isFull ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-500 ease-in-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
