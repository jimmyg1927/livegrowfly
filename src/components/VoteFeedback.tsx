'use client'

import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface VoteFeedbackProps {
  id: string
  votesUp: number
  votesDown: number
  onVote: (id: string, type: 'up' | 'down') => Promise<void>
}

export default function VoteFeedback({
  id,
  votesUp,
  votesDown,
  onVote,
}: VoteFeedbackProps): JSX.Element {
  return (
    <div className="flex space-x-4 mt-2">
      <button
        onClick={() => onVote(id, 'up')}
        className="flex items-center space-x-1 hover:text-accent transition"
      >
        <ThumbsUp size={18} />
        <span className="text-sm">{votesUp}</span>
      </button>
      <button
        onClick={() => onVote(id, 'down')}
        className="flex items-center space-x-1 hover:text-accent transition"
      >
        <ThumbsDown size={18} />
        <span className="text-sm">{votesDown}</span>
      </button>
    </div>
  )
}
