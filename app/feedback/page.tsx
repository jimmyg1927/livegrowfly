'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load feedback.');
      setFeedbackList(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!newFeedback) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newFeedback,
          authorEmail: 'jimmy@growfly.io', // Replace with dynamic user email if needed
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback.');
      setNewFeedback('');
      fetchFeedback();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (feedbackId: string, voteType: 'up' | 'down') => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, voteType }),
      });
      fetchFeedback();
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#2daaff] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name="Community Feedback" />
        <main className="p-6 overflow-y-auto space-y-6">
          <div className="bg-black text-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold mb-2">🧠 We nerds are working to constantly improve Growfly.</h2>
            <p className="mb-4">The most upvoted feedback each week gets worked on by our team. Drop your ideas below!</p>
            {error && <p className="text-red-500">{error}</p>}
            <textarea
              className="w-full p-3 rounded text-black mb-4"
              placeholder="Suggest an improvement or feature..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-800 px-4 py-2 rounded text-white"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>

          <div className="bg-white text-black rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">📢 Community Feedback</h3>
            {feedbackList.length === 0 ? (
              <p>No feedback yet. Be the first to suggest something!</p>
            ) : (
              feedbackList.map((fb) => (
                <div key={fb.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <p className="mb-2">{fb.content}</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleVote(fb.id, 'up')}
                      className="bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 rounded"
                    >
                      👍 {fb.votesUp}
                    </button>
                    <button
                      onClick={() => handleVote(fb.id, 'down')}
                      className="bg-red-600 hover:bg-red-800 text-white px-3 py-1 rounded"
                    >
                      👎 {fb.votesDown}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
