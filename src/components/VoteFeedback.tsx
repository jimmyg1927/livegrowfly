'use client'

import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface VoteFeedbackProps {
  onOpen: () => void
}

export default function VoteFeedback({ onOpen }: VoteFeedbackProps): JSX.Element {
  return (
    <div className="flex space-x-2 mt-2 text-gray-500">
      <button onClick={onOpen} className="hover:text-blue-500 transition">
        <ThumbsUp size={18} />
      </button>
      <button onClick={onOpen} className="hover:text-red-500 transition">
        <ThumbsDown size={18} />
      </button>
    </div>
  )
}
