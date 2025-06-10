'use client'

import React, { useState } from 'react'
import { HiThumbUp, HiThumbDown, HiX, HiSparkles } from 'react-icons/hi'
import { FaHeart, FaCheck } from 'react-icons/fa'

interface ImprovedFeedbackModalProps {
  responseId: string
  open: boolean
  onClose: () => void
  onSubmit?: () => void
}

export default function ImprovedFeedbackModal({
  responseId,
  open,
  onClose,
  onSubmit,
}: ImprovedFeedbackModalProps) {
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        
        {/* ✅ Header with Growfly branding */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <HiX className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="mb-3">
              <HiSparkles className="text-3xl mx-auto mb-2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {submitted ? '🎉 Thank you!' : 'How did we do?'}
            </h2>
            <p className="text-blue-100 text-sm">
              {submitted 
                ? 'Your feedback helps us improve Growfly' 
                : 'Help us make Growfly better for you'
              }
            </p>
          </div>
        </div>

        {/* ✅ Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Feedback Received!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We appreciate you taking the time to help us improve. Your input makes Growfly better for everyone.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ✅ Rating Buttons - Modern design */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                  Rate this response:
                </p>
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => setRating('positive')}
                    className={`group relative p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                      rating === 'positive'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
                    }`}
                    title="Great response!"
                  >
                    <HiThumbUp className="text-2xl" />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        Great!
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setRating('negative')}
                    className={`group relative p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                      rating === 'negative'
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                    }`}
                    title="Needs improvement"
                  >
                    <HiThumbDown className="text-2xl" />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        Not great
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ✅ Comment Section - Modern styling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tell us more (optional):
                </label>
                <textarea
                  placeholder="What went well? What could be improved? Your feedback helps us make Growfly better..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={4}
                />
              </div>

              {/* ✅ Action Buttons - Growfly branded */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                  disabled={submitting}
                >
                  Skip
                </button>
                <button
                  onClick={submitFeedback}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    rating && !submitting
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!rating || submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaHeart className="text-sm" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>

              {/* ✅ Footer note */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your feedback is anonymous and helps improve Growfly for everyone
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}