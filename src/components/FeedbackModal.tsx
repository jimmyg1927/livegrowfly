'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HiThumbUp, HiThumbDown } from 'react-icons/hi'

interface FeedbackModalProps {
  responseId: string
  open: boolean
  onClose: () => void
  onSubmit?: () => void
}

export default function FeedbackModal({
  responseId,
  open,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submitFeedback = async () => {
    if (!rating) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('growfly_jwt')
      await fetch('/api/feedback/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` || '',
        },
        body: JSON.stringify({
          responseId,
          feedback: comment,
          rating: rating === 'positive' ? 1 : 0,
        }),
      })
      setSubmitted(true)
      onSubmit?.()
      setTimeout(onClose, 2000)
    } catch (err) {
      console.error(err)
      alert('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogTrigger asChild>
        <></>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-background text-textPrimary">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {submitted ? 'Thanks for your feedback!' : 'How did we do?'}
          </DialogTitle>
        </DialogHeader>

        {!submitted && (
          <div className="space-y-4">
            <div className="flex justify-center gap-8 text-3xl">
              <button
                onClick={() => setRating('positive')}
                className={`p-3 rounded-full transition shadow ${
                  rating === 'positive' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
                }`}
                title="Thumbs Up"
              >
                <HiThumbUp />
              </button>
              <button
                onClick={() => setRating('negative')}
                className={`p-3 rounded-full transition shadow ${
                  rating === 'negative' ? 'bg-red-500 text-white' : 'bg-gray-300 text-black'
                }`}
                title="Thumbs Down"
              >
                <HiThumbDown />
              </button>
            </div>
            <textarea
              placeholder="Any comments?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-muted focus:outline-none"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!rating || submitting}
              >
                {submitting ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
