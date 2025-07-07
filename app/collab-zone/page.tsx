"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Share2,
  MessageSquare,
  Maximize2,
  Minimize2,
  Save,
  Download,
  Menu,
  X,
  Trash2,
  Send,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

// TypeScript interfaces
interface Document {
  id: string
  title: string
  content: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: string
  docId: string
  documentId?: string
  userId: string
  text: string
  from: number
  to: number
  resolved: boolean
  isRead: boolean
  createdAt: string
  user?: {
    id: string
    name?: string
    email: string
  }
}

interface StatusMessage {
  type: 'success' | 'error'
  text: string
}

interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  message?: string
  link?: string
  data?: T
}

// API helper functions
const API_BASE = 'https://glowfly-api-production.up.railway.app/api'

const apiCall = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })
    
    if (!response.ok) {
      let errorMessage = 'API call failed'
      try {
        const error = await response.json()
        errorMessage = error.error || error.message || errorMessage
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Document Header Component
const DocumentHeader: React.FC<{
  activeDoc: Document | null
  onSave: () => void
  onShare: () => void
  onFullscreen: () => void
  onToggleComments: () => void
  showComments: boolean
  commentsCount: number
  isAutoSaving: boolean
  onToggleDocuments: () => void
  showDocuments: boolean
}> = ({ 
  activeDoc, 
  onSave, 
  onShare, 
  onFullscreen, 
  onToggleComments, 
  showComments, 
  commentsCount, 
  isAutoSaving, 
  onToggleDocuments, 
  showDocuments 
}) => (
  <motion.header 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleDocuments}
          className={`p-3 rounded-2xl transition-all duration-200 ${
            showDocuments 
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <Menu className="w-5 h-5" />
        </motion.button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              {activeDoc?.title || 'Untitled Document'}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {activeDoc && (
                <span>Last updated {new Date(activeDoc.updatedAt).toLocaleString()}</span>
              )}
              {isAutoSaving && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Saving...
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleComments}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            showComments
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments
          {commentsCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {commentsCount}
            </motion.span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onFullscreen}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
        >
          <Maximize2 className="w-4 h-4" />
          Focus
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg shadow-green-500/30"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30"
        >
          <Save className="w-4 h-4" />
          Save
        </motion.button>
      </div>
    </div>
  </motion.header>
)

// Documents Sidebar Component
const DocumentsSidebar: React.FC<{
  isVisible: boolean
  docs: Document[]
  activeDoc: Document | null
  onSelectDoc: (doc: Document) => void
  onNewDoc: () => void
  onDeleteDoc: (docId: string) => void
  onClose: () => void
}> = ({ 
  isVisible, 
  docs, 
  activeDoc, 
  onSelectDoc, 
  onNewDoc, 
  onDeleteDoc, 
  onClose 
}) => (
  <motion.div
    initial={{ x: -400, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -400, opacity: 0 }}
    transition={{ type: "spring", damping: 25, stiffness: 300 }}
    className="fixed left-0 top-0 h-full w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 shadow-2xl z-40 flex flex-col"
  >
    <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
          Documents
        </h2>
      </div>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      >
        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </motion.button>
    </div>

    <div className="p-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewDoc}
        className="w-full flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-xl shadow-blue-500/30 mb-6"
      >
        <Plus className="w-5 h-5" />
        Create New Document
      </motion.button>
    </div>

    <div className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="space-y-3">
        {docs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No documents yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first document to get started</p>
          </div>
        ) : (
          docs.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                activeDoc?.id === doc.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-lg'
                  : 'bg-gray-50/50 dark:bg-slate-700/50 border-gray-200/50 dark:border-slate-600/50 hover:bg-gray-100/80 dark:hover:bg-slate-600/80 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
              onClick={() => onSelectDoc(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                    {doc.content ? doc.content.substring(0, 100) + '...' : 'Empty document'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteDoc(doc.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  </motion.div>
)

// Comments Sidebar Component
const CommentsSidebar: React.FC<{
  isVisible: boolean
  comments: Comment[]
  activeDocId: string | null
  onAddComment: (text: string, from: number, to: number) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  onClose: () => void
}> = ({ 
  isVisible, 
  comments, 
  activeDocId, 
  onAddComment, 
  onDeleteComment, 
  onClose 
}) => {
  const [newComment, setNewComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  const docComments = comments.filter(c => 
    c.documentId === activeDocId || c.docId === activeDocId
  )

  const handleSubmit = async (): Promise<void> => {
    if (!newComment.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onAddComment(newComment, 0, 0)
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 shadow-2xl z-40 flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Comments ({docComments.length})
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </motion.button>
      </div>

      <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 bg-gray-50/80 dark:bg-slate-700/80 border border-gray-200/50 dark:border-slate-600/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-sm leading-relaxed"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit()
              }
            }}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {docComments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start the conversation by adding a comment</p>
            </div>
          ) : (
            docComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-4 bg-gray-50/80 dark:bg-slate-700/80 rounded-2xl border border-gray-200/50 dark:border-slate-600/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(comment.user?.name || comment.user?.email || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {comment.user?.name || comment.user?.email || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {comment.text}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Rich Text Editor Component
const Editor: React.FC<{
  content: string
  setContent: (content: string) => void
  docId: string
  showComments: boolean
}> = ({ content, setContent, docId, showComments }) => {
  const [isFocused, setIsFocused] = useState<boolean>(false)

  return (
    <div className="h-full flex flex-col">
      <div className={`flex-1 p-8 transition-all duration-300 ${isFocused ? 'bg-white dark:bg-slate-800' : ''}`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Start writing your document... ✨"
          className="w-full h-full resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white text-lg leading-relaxed font-medium placeholder-gray-400 dark:placeholder-gray-500"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        />
      </div>
    </div>
  )
}

// Share Modal Component
const ShareModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  activeDoc: Document | null
  onShare: (email: string) => Promise<ApiResponse>
}> = ({ isOpen, onClose, activeDoc, onShare }) => {
  const [email, setEmail] = useState<string>('')
  const [shareLink, setShareLink] = useState<string>('')
  const [isSharing, setIsSharing] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const handleShareByEmail = async (): Promise<void> => {
    if (!email.trim() || isSharing) return
    
    setIsSharing(true)
    try {
      await onShare(email)
      setEmail('')
    } finally {
      setIsSharing(false)
    }
  }

  const handleGetLink = async (): Promise<void> => {
    setIsSharing(true)
    try {
      const result = await onShare('')
      if (result?.link) {
        setShareLink(result.link)
      }
    } finally {
      setIsSharing(false)
    }
  }

  const copyToClipboard = async (): Promise<void> => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-slate-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Share Document
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activeDoc?.title}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Share with specific user
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 p-4 bg-gray-50/80 dark:bg-slate-700/80 border border-gray-200/50 dark:border-slate-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleShareByEmail()
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareByEmail}
                  disabled={!email.trim() || isSharing}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Share'
                  )}
                </motion.button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/50 dark:border-slate-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium">
                  or
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Get shareable link
              </label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    placeholder="Click 'Generate Link' to create a shareable URL"
                    className="flex-1 p-4 bg-gray-50/80 dark:bg-slate-700/80 border border-gray-200/50 dark:border-slate-600/50 rounded-2xl text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGetLink}
                    disabled={isSharing}
                    className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSharing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Generate'
                    )}
                  </motion.button>
                </div>
                
                {shareLink && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Copied to clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy to clipboard
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Collab Zone Component
const CollabZone: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([])
  const [activeDoc, setActiveDoc] = useState<Document | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showDocuments, setShowDocuments] = useState<boolean>(false)
  const [showComments, setShowComments] = useState<boolean>(false)
  const [showShareModal, setShowShareModal] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false)
  const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null)

  // Status message helper
  const showStatus = useCallback((type: 'success' | 'error', text: string): void => {
    setStatusMsg({ type, text })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  // Load documents from API
  const loadDocuments = useCallback(async (): Promise<void> => {
    try {
      const data = await apiCall<Document[]>('/collab')
      setDocs(data)
    } catch (error) {
      showStatus('error', 'Failed to load documents')
      console.error('Load documents error:', error)
    }
  }, [showStatus])

  // Load comments for active document
  const loadComments = useCallback(async (): Promise<void> => {
    if (!activeDoc) return
    
    try {
      const data = await apiCall<Comment[]>(`/comments/${activeDoc.id}`)
      setComments(data)
    } catch (error) {
      showStatus('error', 'Failed to load comments')
      console.error('Load comments error:', error)
    }
  }, [activeDoc, showStatus])

  // Save document
  const saveDocument = useCallback(async (doc: Document): Promise<void> => {
    if (!doc) return
    
    try {
      setIsAutoSaving(true)
      const updated = await apiCall<Document>(`/collab/${doc.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: doc.title,
          content: doc.content
        })
      })
      
      // Update local state
      setDocs(prev => prev.map(d => d.id === doc.id ? updated : d))
      if (activeDoc && activeDoc.id === doc.id) {
        setActiveDoc(updated)
      }
      
      showStatus('success', '💾 Document saved!')
    } catch (error) {
      showStatus('error', 'Failed to save document')
      console.error('Save document error:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [activeDoc, showStatus])

  // Auto-save effect
  useEffect(() => {
    if (!activeDoc) return
    
    const timeoutId = setTimeout(() => {
      saveDocument(activeDoc)
    }, 2000) // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timeoutId)
  }, [activeDoc?.content, saveDocument])

  // Handle manual save
  const handleSave = useCallback((): void => {
    if (activeDoc) {
      saveDocument(activeDoc)
    }
  }, [activeDoc, saveDocument])

  // Create new document
  const handleNewDoc = useCallback(async (): Promise<void> => {
    try {
      const newDoc = await apiCall<Document>('/collab', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Untitled Document',
          content: ''
        })
      })
      
      setDocs(prev => [newDoc, ...prev])
      setActiveDoc(newDoc)
      showStatus('success', '📄 New document created!')
    } catch (error) {
      showStatus('error', 'Failed to create document')
      console.error('Create document error:', error)
    }
  }, [showStatus])

  // Delete document
  const handleDeleteDoc = useCallback(async (docId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    
    try {
      await apiCall(`/collab/${docId}`, { method: 'DELETE' })
      
      setDocs(prev => prev.filter(d => d.id !== docId))
      if (activeDoc && activeDoc.id === docId) {
        setActiveDoc(null)
      }
      
      showStatus('success', '🗑️ Document deleted')
    } catch (error) {
      showStatus('error', 'Failed to delete document')
      console.error('Delete document error:', error)
    }
  }, [activeDoc, showStatus])

  // Share document
  const handleShare = useCallback(async (email: string): Promise<ApiResponse> => {
    if (!activeDoc) throw new Error('No active document')
    
    try {
      const result = await apiCall<ApiResponse>(`/collab/${activeDoc.id}/share`, {
        method: 'POST',
        body: JSON.stringify({ email: email || undefined })
      })
      
      if (result.link) {
        showStatus('success', '🔗 Share link generated!')
      } else if (result.message) {
        showStatus('success', result.message)
      } else {
        showStatus('success', '📤 Document shared successfully!')
      }
      
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share document'
      showStatus('error', message)
      console.error('Share document error:', error)
      throw error
    }
  }, [activeDoc, showStatus])

  // Add comment
  const handleAddComment = useCallback(async (text: string, from: number, to: number): Promise<void> => {
    if (!activeDoc) return
    
    try {
      const comment = await apiCall<Comment>('/comments', {
        method: 'POST',
        body: JSON.stringify({
          docId: activeDoc.id,
          text,
          from: from || 0,
          to: to || 0
        })
      })
      
      setComments(prev => [...prev, comment])
      showStatus('success', '💬 Comment added!')
    } catch (error) {
      showStatus('error', 'Failed to add comment')
      console.error('Add comment error:', error)
    }
  }, [activeDoc, showStatus])

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      await apiCall(`/comments/${commentId}`, { method: 'DELETE' })
      
      setComments(prev => prev.filter(c => c.id !== commentId))
      showStatus('success', '🗑️ Comment deleted')
    } catch (error) {
      showStatus('error', 'Failed to delete comment')
      console.error('Delete comment error:', error)
    }
  }, [showStatus])

  // Handle shared document access from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sharedDocId = urlParams.get('doc')
    
    if (sharedDocId) {
      const loadSharedDoc = async (): Promise<void> => {
        try {
          const sharedDoc = await apiCall<Document>(`/collab/${sharedDocId}`)
          setActiveDoc(sharedDoc)
          showStatus('success', '📄 Shared document loaded!')
        } catch (error) {
          showStatus('error', 'Shared document not found or access denied')
          console.error('Load shared document error:', error)
        }
      }
      
      loadSharedDoc()
    }
  }, [showStatus])

  // Load data on mount
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true)
      try {
        await loadDocuments()
      } catch (error) {
        console.error('Initial load error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [loadDocuments])

  // Load comments when active document changes
  useEffect(() => {
    if (activeDoc) {
      loadComments()
    }
  }, [activeDoc, loadComments])

  // Update active document content
  const updateActiveDocContent = useCallback((content: string): void => {
    if (activeDoc) {
      setActiveDoc({ ...activeDoc, content })
    }
  }, [activeDoc])

  const unreadCommentsCount = comments.filter(c => 
    (c.documentId === activeDoc?.id || c.docId === activeDoc?.id) && !c.isRead
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-200/30 border-t-blue-600 rounded-full mx-auto mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3">
              Loading your workspace...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Preparing your documents and collaboration tools ✨</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isFullscreen && activeDoc) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 z-50 flex flex-col">
        <DocumentHeader 
          activeDoc={activeDoc}
          onSave={handleSave}
          onShare={() => setShowShareModal(true)}
          onFullscreen={() => setIsFullscreen(false)}
          onToggleComments={() => setShowComments(!showComments)}
          showComments={showComments}
          commentsCount={unreadCommentsCount}
          isAutoSaving={isAutoSaving}
          onToggleDocuments={() => setShowDocuments(!showDocuments)}
          showDocuments={showDocuments}
        />
        
        <div className="flex-1 overflow-hidden p-8">
          <div className="max-w-6xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 h-full overflow-hidden">
            <Editor
              key={`fullscreen-${activeDoc.id}`}
              content={activeDoc.content}
              setContent={updateActiveDocContent}
              docId={activeDoc.id}
              showComments={false}
            />
          </div>
        </div>

        <AnimatePresence>
          {showComments && (
            <CommentsSidebar
              isVisible={showComments}
              comments={comments}
              activeDocId={activeDoc.id}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onClose={() => setShowComments(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      {/* Document Header */}
      <DocumentHeader 
        activeDoc={activeDoc}
        onSave={handleSave}
        onShare={() => setShowShareModal(true)}
        onFullscreen={() => setIsFullscreen(true)}
        onToggleComments={() => setShowComments(!showComments)}
        showComments={showComments}
        commentsCount={unreadCommentsCount}
        isAutoSaving={isAutoSaving}
        onToggleDocuments={() => setShowDocuments(!showDocuments)}
        showDocuments={showDocuments}
      />

      {/* Status Messages */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-4 rounded-2xl font-semibold shadow-2xl backdrop-blur-md ${
              statusMsg.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white border border-emerald-400/50'
                : 'bg-gradient-to-r from-red-500/90 to-pink-600/90 text-white border border-red-400/50'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <span className="text-base">{statusMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Documents Sidebar */}
        <AnimatePresence>
          {showDocuments && (
            <DocumentsSidebar
              isVisible={showDocuments}
              docs={docs}
              activeDoc={activeDoc}
              onSelectDoc={(doc) => {
                setActiveDoc(doc)
                setShowDocuments(false)
              }}
              onNewDoc={handleNewDoc}
              onDeleteDoc={handleDeleteDoc}
              onClose={() => setShowDocuments(false)}
            />
          )}
        </AnimatePresence>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeDoc ? (
            <div className="flex-1 p-6 overflow-hidden">
              <div className="max-w-5xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 h-full overflow-hidden">
                <Editor
                  key={activeDoc.id}
                  content={activeDoc.content}
                  setContent={updateActiveDocContent}
                  docId={activeDoc.id}
                  showComments={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center max-w-lg mx-auto">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30"
                >
                  <FileText className="w-12 h-12 text-white" />
                </motion.div>
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-4"
                >
                  Welcome to Collab Zone ✨
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-lg"
                >
                  Create beautiful documents and collaborate with your team in real-time. Your ideas deserve the perfect workspace.
                </motion.p>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button
                    onClick={handleNewDoc}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-xl shadow-blue-500/30 hover:scale-105 text-base"
                  >
                    <Plus className="w-5 h-5" />
                    Create Document
                  </button>
                  <button
                    onClick={() => setShowDocuments(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:from-gray-200 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 font-bold border border-gray-200/50 dark:border-slate-600/50 hover:scale-105 text-base"
                  >
                    <FileText className="w-5 h-5" />
                    Browse Documents
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Comments Sidebar */}
        <AnimatePresence>
          {showComments && (
            <CommentsSidebar
              isVisible={showComments}
              comments={comments}
              activeDocId={activeDoc?.id || null}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onClose={() => setShowComments(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        activeDoc={activeDoc}
        onShare={handleShare}
      />
    </div>
  )
}

export default CollabZone