'use client';

import React from 'react';

type VoteFeedbackProps = {
  response: string;
};

export default function VoteFeedback({ response }: VoteFeedbackProps) {
  const handleVote = async (vote: 'up' | 'down') => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote, response }),
      });
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  return (
    <div className="mt-4 flex items-center space-x-4">
      <span className="text-sm text-gray-600">Was this helpful?</span>
      <button
        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        onClick={() => handleVote('up')}
      >
        👍 Yes
      </button>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        onClick={() => handleVote('down')}
      >
        👎 No
      </button>
    </div>
  );
}
