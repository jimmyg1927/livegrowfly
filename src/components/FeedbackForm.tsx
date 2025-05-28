'use client'

import React, { useState } from 'react'

interface FeedbackFormProps {
  onCreated: () => void
}

export default function FeedbackForm({ onCreated }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit logic
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-2 border rounded text-black"
        placeholder="Enter your feedback"
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-textPrimary rounded"
      >
        Submit
      </button>
    </form>
  )
}
