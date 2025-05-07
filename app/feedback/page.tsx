// File: /app/feedback/page.tsx
'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import FeedbackForm from '@/components/FeedbackForm'

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 overflow-y-auto">
          {submitted ? (
            <p className="text-green-600">Thank you for your feedback!</p>
          ) : (
            <FeedbackForm onCreated={() => setSubmitted(true)} />
          )}
        </main>
      </div>
    </div>
  )
}
