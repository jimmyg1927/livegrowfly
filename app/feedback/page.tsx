'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '../../src/components/Sidebar'
import Header from '../../src/components/Header'
import FeedbackForm from '../../src/components/FeedbackForm'
import VoteFeedback from '../../src/components/VoteFeedback'
import { API_BASE_URL } from '@/lib/constants'

interface FeedbackItem {
  id: string
  content: string
  votesUp: number
  votesDown: number
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('growfly_jwt')
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setFeedbackList(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (id: string, type: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('growfly_jwt')
      await fetch(`${API_BASE_URL}/api/feedback/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, type }),
      })
      fetchFeedback()
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <aside className="w-64">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Header name="Community Feedback" />
        <main className="flex-1 overflow-y-auto p-6">
          <FeedbackForm onCreated={fetchFeedback} />
          {loading && <div className="spinner" />}
          {!loading &&
            feedbackList.map((item) => (
              <div key={item.id} className="bg-card rounded p-4 mb-4">
                <p className="text-textPrimary">{item.content}</p>
                <VoteFeedback
                  id={item.id}
                  votesUp={item.votesUp}
                  votesDown={item.votesDown}
                  onVote={handleVote}
                />
              </div>
            ))}
        </main>
      </div>
    </div>
  )
}
