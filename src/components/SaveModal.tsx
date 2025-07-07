// src/components/SaveModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export interface SaveModalProps {
  open: boolean
  onClose: () => void
  messageId: string
  onSaveResponse: (title: string, messageId: string) => Promise<any>
  onSaveToCollabZone: (title: string, messageId: string) => Promise<any>
}

export default function SaveModal({ 
  open, 
  onClose, 
  messageId, 
  onSaveResponse, 
  onSaveToCollabZone 
}: SaveModalProps) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saveType, setSaveType] = useState<'response' | 'collab'>('response')

  useEffect(() => {
    if (!open) {
      setTitle('')
      setSaveType('response')
    }
  }, [open])

  const handleSave = async () => {
    if (!title.trim()) return
    
    setIsLoading(true)
    try {
      if (saveType === 'response') {
        await onSaveResponse(title.trim(), messageId)
      } else {
        await onSaveToCollabZone(title.trim(), messageId)
      }
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Save this response
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose where to save this response and give it a name.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Save Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Save to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSaveType('response')}
                  disabled={isLoading}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    saveType === 'response'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">📝</span>
                    <span>Saved Responses</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSaveType('collab')}
                  disabled={isLoading}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    saveType === 'collab'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">🤝</span>
                    <span>Collab Zone</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Instagram Growth Plan"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && title.trim() && !isLoading) {
                    handleSave()
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}