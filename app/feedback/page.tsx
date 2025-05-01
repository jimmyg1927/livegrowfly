'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import axios from 'axios'

interface Feedback {
  id: string
  content: string
  upvotes: number
  downvotes: number
  status: 'approved' | 'pending'
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get('/api/feedback')
        setFeedbackList(res.data)
      } catch (err) {
        console.error('Failed to fetch feedback', err)
      }
    }

    fetchFeedback()
  }, [])

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <aside className="w-64">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        {/* ✅ FIXED: Header now has required prop */}
        <Header name="feedback@growfly.io" />

        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">User Feedback</h1>

          <p className="mb-6 text-muted">
            We nerds are working to constantly improve our system. Your feedback helps! 
            The most upvoted feedback each week gets worked on by our team.
          </p>

          <div className="space-y-4">
            {feedbackList
              .filter((fb) => fb.status === 'approved')
              .map((fb) => (
                <div
                  key={fb.id}
                  className="bg-card p-4 rounded-md shadow-sm flex justify-between items-center"
                >
                  <p>{fb.content}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">👍 {fb.upvotes}</span>
                    <span className="text-sm">👎 {fb.downvotes}</span>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  )
}
