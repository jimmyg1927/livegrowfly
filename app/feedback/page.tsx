'use client';

import { useEffect, useState } from 'react';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [voteMessage, setVoteMessage] = useState('');
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`);
        const data = await res.json();
        if (res.ok) {
          setFeedback(data.feedback);
        } else {
          setError(data.error || 'Failed to load feedback.');
        }
      } catch (err) {
        setError('Server error while loading feedback.');
      }
    };
    fetchFeedback();
  }, []);

  const handleVote = async (id: string, vote: 'up' | 'down') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, vote }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoteMessage('Thanks for your vote!');
        setTimeout(() => setVoteMessage(''), 2000);
        // Refresh feedback list
        const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`);
        const refreshedData = await refreshed.json();
        setFeedback(refreshedData.feedback);
      } else {
        setError(data.error || 'Failed to submit vote.');
      }
    } catch (err) {
      setError('Server error while submitting vote.');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newFeedback.trim()) {
      setError('Feedback message cannot be empty.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newFeedback }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewFeedback('');
        // Refresh feedback
        const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`);
        const refreshedData = await refreshed.json();
        setFeedback(refreshedData.feedback);
      } else {
        setError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('Server error while submitting feedback.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-300 p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">📢 Community Feedback</h1>
      
      {error && <p className="text-red-300 mb-4">{error}</p>}
      {voteMessage && <p className="text-green-300 mb-4">{voteMessage}</p>}

      <form onSubmit={handleFeedbackSubmit} className="mb-6">
        <textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Share your idea or feedback..."
          className="w-full p-4 rounded bg-white text-black mb-4"
        />
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded"
        >
          Submit Feedback
        </button>
      </form>

      <div className="space-y-4">
        {feedback.map((fb) => (
          <div key={fb.id} className="bg-white text-black p-4 rounded-lg shadow">
            <p className="mb-2">{fb.message}</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote(fb.id, 'up')}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                👍 {fb.upvotes}
              </button>
              <button
                onClick={() => handleVote(fb.id, 'down')}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                👎 {fb.downvotes}
              </button>
              <span className="text-sm text-gray-600">Submitted on {new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
