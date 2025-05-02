'use client'

import React from 'react'

export default function PromptTracker({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100)
  const isFull = used >= limit

  return (
    <div className="w-full max-w-xs bg-muted p-4 rounded-2xl shadow-sm flex flex-col gap-2 border border-border">
      <div className="flex justify-between items-center text-xs font-medium text-foreground/80">
        <span>Prompts Used</span>
        <span className="text-foreground">{used} / {limit}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full ${isFull ? 'bg-red-500' : 'bg-primary'} transition-all duration-500 ease-in-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
