'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Save, CheckCircle, AlertCircle, 
  FileText, Users, Search, Copy, Share2, Menu,
  ChevronUp, ChevronDown, Maximize2, MessageSquare, X,
  Download, Clock, Star, MoreHorizontal, Eye, Minimize2,
  Sidebar, PanelRightClose, PanelRightOpen, FolderOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@/components/editor/Editor'
import { formatDistanceToNow } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Doc {
  id: string
  title: string
  content: string
  updatedAt: string
  createdAt?: string
  sharedBy?: string
  isShared?: boolean
}

interface Comment {
  id: string
  text: string
  author: string
  timestamp: Date
  from: number
  to: number
  resolved?: boolean
  documentId?: string
  isRead?: boolean
}

// Utility function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Utility function to validate JWT token format
const isValidToken = (token: string): boolean => {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
  return jwtRegex.test(token)
}

// Main Document Header - Clean and Minimal
function DocumentHeader({ 
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
}: {
  activeDoc: Doc | null
  onSave: () => void
  onShare: () => void
  onFullscreen: () => void
  onToggleComments: () => void
  showComments: boolean
  commentsCount: number
  isAutoSaving: boolean
  onToggleDocuments: () => void
  showDocuments: boolean
}) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const startRename = useCallback(() => {
    if (activeDoc) {
      setNewTitle(activeDoc.title)
      setIsRenaming(true)
    }
  }, [activeDoc])

  const handleRename = useCallback(async () => {
    if (!activeDoc || !newTitle.trim()) {
      setIsRenaming(false)
      return
    }

    const sanitizedTitle = sanitizeInput(newTitle.trim())
    if (sanitizedTitle.length > 255) {
      alert('Title is too long (max 255 characters)')
      return
    }

    setIsRenaming(false)
  }, [activeDoc, newTitle])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setIsRenaming(false)
      setNewTitle('')
    }
  }, [handleRename])

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 z-30 sticky top-0">
      <div className="flex items-center justify-between">
        {/* Left: Document Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleDocuments}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showDocuments 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700" />

          {activeDoc && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              
              {isRenaming ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white min-w-0"
                  autoFocus
                  maxLength={255}
                />
              ) : (
                <div className="min-w-0">
                  <h1 
                    className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-all truncate"
                    onClick={startRename}
                  >
                    {activeDoc.title}
                  </h1>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                    </span>
                    {isAutoSaving && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                          <span className="text-sm text-amber-600 dark:text-amber-400">Saving...</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        {activeDoc && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleComments}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                showComments
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
              {commentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {commentsCount}
                </span>
              )}
            </button>

            <button
              onClick={onFullscreen}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 text-sm font-medium"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden lg:inline">Focus</span>
            </button>

            <button
              onClick={() => {
                if (activeDoc) {
                  const token = localStorage.getItem('growfly_jwt')
                  if (token) {
                    window.open(`${API_URL}/api/collab/${activeDoc.id}/download?type=pdf&token=${token}`, '_blank')
                  }
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Download</span>
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-semibold shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// Documents Sidebar - Left Panel
function DocumentsSidebar({ 
  isVisible, 
  docs, 
  activeDoc, 
  onSelectDoc, 
  onNewDoc, 
  onDeleteDoc,
  onClose
}: {
  isVisible: boolean
  docs: Doc[]
  activeDoc: Doc | null
  onSelectDoc: (doc: Doc) => void
  onNewDoc: () => void
  onDeleteDoc: (id: string) => void
  onClose: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'recent' | 'shared' | 'all'>('recent')

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (activeTab) {
      case 'recent':
        return matchesSearch && !doc.isShared
      case 'shared':
        return matchesSearch && doc.isShared
      case 'all':
      default:
        return matchesSearch
    }
  })

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setSearchTerm(sanitizedValue)
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-50 flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Documents</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewDoc}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={100}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            {[
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'shared', label: 'Shared', icon: Users },
              { id: 'all', label: 'All', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-xs ${
                  activeTab === id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Create your first document to get started</p>
              <button
                onClick={onNewDoc}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
              >
                Create Document
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                    activeDoc?.id === doc.id
                      ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => onSelectDoc(doc)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteDoc(doc.id)
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500 transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate text-sm">
                    {doc.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
                    {doc.isShared && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Shared</span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {doc.content.replace(/<[^>]*>/g, '').substring(0, 60) || 'No content yet...'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// Comments Sidebar - Right Panel
function CommentsSidebar({ 
  isVisible, 
  comments, 
  activeDocId, 
  onAddComment, 
  onDeleteComment,
  onClose
}: {
  isVisible: boolean
  comments: Comment[]
  activeDocId: string | null
  onAddComment: (text: string, from?: number, to?: number) => void
  onDeleteComment: (id: string) => void
  onClose: () => void
}) {
  const [newComment, setNewComment] = useState('')

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaArea>) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    if (sanitizedValue.length <= 1000) {
      setNewComment(sanitizedValue)
    }
  }, [])

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }, [newComment, onAddComment])

  if (!isVisible || !activeDocId) return null

  const docComments = comments.filter(c => c.documentId === activeDocId)

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        exit={{ x: 320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 z-50 flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Comments</h3>
              <span className="text-sm bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {docComments.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {docComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No comments yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Add the first comment below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {docComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</div>
                        <div className="text-xs text-gray-500">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500 transition-all duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {comment.from !== comment.to && (
                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        Text selection ({comment.from}-{comment.to})
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comment.text}
                  </p>

                  {comment.resolved && (
                    <div className="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Resolved</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={handleCommentChange}
            className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {newComment.length}/1000
            </span>
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Share Modal Component
function ShareModal({ isOpen, onClose, activeDoc, onShare }: {
  isOpen: boolean
  onClose: () => void
  activeDoc: Doc | null
  onShare: (email?: string) => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const generateShareLink = useCallback(async () => {
    if (!activeDoc) return
    
    setIsLoading(true)
    try {
      await onShare()
      const link = `${window.location.origin}/collab-zone?doc=${activeDoc.id}`
      setShareLink(link)
    } catch (error) {
      console.error('Failed to generate share link:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeDoc, onShare])

  const handleEmailShare = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setIsLoading(true)
    try {
      await onShare(email.trim())
      setEmail('')
      onClose()
    } catch (error) {
      console.error('Failed to share with email:', error)
    } finally {
      setIsLoading(false)
    }
  }, [email, onShare, onClose])

  const copyToClipboard = useCallback(async () => {
    if (!shareLink) return
    
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [shareLink])

  useEffect(() => {
    if (isOpen && activeDoc) {
      generateShareLink()
    }
  }, [isOpen, activeDoc, generateShareLink])

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setShareLink('')
      setCopySuccess(false)
    }
  }, [isOpen])

  if (!isOpen || !activeDoc) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md z-50"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Document
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Anyone with the link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none text-sm"
                placeholder={isLoading ? "Generating link..." : "Share link will appear here"}
              />
              <button
                onClick={copyToClipboard}
                disabled={!shareLink}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  copySuccess
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200'
                } disabled:opacity-50`}
              >
                {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Email Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share with specific people
            </label>
            <form onSubmit={handleEmailShare} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!email.trim() || isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
              >
                {isLoading ? 'Sharing...' : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function GoogleDocsCollabZone() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDocuments, setShowDocuments] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([])

  const showStatus = useCallback((type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  // Load comments from backend
  const loadComments = useCallback(async (docId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${docId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (res.ok) {
        const commentsData = await res.json()
        const formattedComments = commentsData.map((comment: any) => ({
          id: comment.id,
          text: comment.text,
          author: comment.user?.name || comment.user?.email || 'Unknown',
          timestamp: new Date(comment.createdAt),
          from: comment.from,
          to: comment.to,
          resolved: comment.resolved,
          documentId: docId,
          isRead: true
        }))
        setComments(formattedComments)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }, [])

  const saveCommentToBackend = useCallback(async (docId: string, text: string, from: number = 0, to: number = 0) => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) {
      router.push('/login')
      return null
    }

    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          docId,
          text: sanitizeInput(text),
          from,
          to
        }),
      })
      
      if (res.ok) {
        const comment = await res.json()
        return comment
      } else {
        throw new Error('Failed to save comment')
      }
    } catch (error) {
      console.error('Failed to save comment:', error)
      showStatus('error', 'Failed to save comment')
      return null
    }
  }, [router, showStatus])

  const deleteCommentFromBackend = useCallback(async (commentId: string) => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) {
      router.push('/login')
      return false
    }

    try {
      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      if (res.ok) {
        return true
      } else {
        throw new Error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      showStatus('error', 'Failed to delete comment')
      return false
    }
  }, [router, showStatus])

  // Auto-save functionality
  const autoSave = useCallback(async (doc: Doc) => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) return

    setIsAutoSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/collab/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: sanitizeInput(doc.content),
          title: sanitizeInput(doc.title),
        }),
      })
      
      if (res.ok) {
        const updated = await res.json()
        setDocs(prev => prev.map(d => d.id === updated.id ? updated : d))
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!activeDoc) return

    const timeoutId = setTimeout(() => {
      autoSave(activeDoc)
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [activeDoc?.content, autoSave])

  const loadDocuments = useCallback(async (token: string) => {
    if (!isValidToken(token)) {
      showStatus('error', 'Invalid authentication token')
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const [docsRes, sharedRes] = await Promise.all([
        fetch(`${API_URL}/api/collab`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/api/collab/shared`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])
      
      if (docsRes.status === 401 || sharedRes.status === 401) {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
        return
      }
      
      const [ownedDocs, sharedDocs] = await Promise.all([
        docsRes.ok ? docsRes.json() : [],
        sharedRes.ok ? sharedRes.json() : []
      ])

      const allDocs = [
        ...ownedDocs,
        ...sharedDocs.map((doc: any) => ({ ...doc, isShared: true }))
      ]

      setDocs(allDocs)
      if (!activeDoc && allDocs.length) setActiveDoc(allDocs[0])
    } catch (error) {
      console.error('Failed to load documents:', error)
      showStatus('error', 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [router, activeDoc, showStatus])

  const handleNewDoc = useCallback(async () => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/collab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: sanitizeInput('Untitled Document'), 
          content: '' 
        }),
      })
      
      if (res.status === 401) {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
        return
      }

      if (res.ok) {
        const created = await res.json()
        setDocs(prev => [created, ...prev])
        setActiveDoc(created)
        setShowDocuments(false)
        showStatus('success', '✨ New document created!')
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (error) {
      console.error('Failed to create document:', error)
      showStatus('error', 'Failed to create document')
    }
  }, [router, showStatus])

  const handleSave = useCallback(async () => {
    if (!activeDoc) return
    
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: sanitizeInput(activeDoc.content),
          title: sanitizeInput(activeDoc.title),
        }),
      })
      
      if (res.status === 401) {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
        return
      }

      if (res.ok) {
        const updated = await res.json()
        setDocs(prev => prev.map(doc => doc.id === updated.id ? updated : doc))
        setActiveDoc(updated)
        showStatus('success', '💾 Document saved!')
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (error) {
      console.error('Failed to save document:', error)
      showStatus('error', 'Failed to save document')
    }
  }, [activeDoc, router, showStatus])

  const handleDeleteDoc = useCallback(async (id: string) => {
    if (!confirm('Delete this document? This action cannot be undone.')) return
    
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/collab/${id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      if (res.status === 401) {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
        return
      }

      if (res.ok) {
        setDocs(prev => prev.filter(doc => doc.id !== id))
        if (activeDoc?.id === id) {
          const remainingDocs = docs.filter(doc => doc.id !== id)
          setActiveDoc(remainingDocs.length > 0 ? remainingDocs[0] : null)
        }
        showStatus('success', '🗑️ Document deleted')
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      showStatus('error', 'Failed to delete document')
    }
  }, [activeDoc, docs, router, showStatus])

  const handleShare = useCallback(async (email?: string) => {
    if (!activeDoc) return
    
    const token = localStorage.getItem('growfly_jwt')
    if (!token || !isValidToken(token)) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(email ? { email } : {}),
      })
      
      if (res.status === 401) {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
        return
      }

      if (res.ok) {
        const result = await res.json()
        if (email) {
          showStatus('success', `✉️ Document shared with ${email}`)
        } else {
          showStatus('success', '🔗 Share link generated!')
        }
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Failed to share document')
      }
    } catch (error) {
      console.error('Failed to share document:', error)
      showStatus('error', 'Failed to share document')
      throw error
    }
  }, [activeDoc, router, showStatus])

  // Handle shared document access from URL
  const handleSharedDocumentAccess = useCallback(async (docId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/collab/${docId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (res.ok) {
        const sharedDoc = await res.json()
        setActiveDoc(sharedDoc)
        showStatus('success', '📄 Shared document loaded!')
        
        const url = new URL(window.location.href)
        url.searchParams.delete('doc')
        window.history.replaceState({}, '', url.toString())
      } else if (res.status === 404) {
        showStatus('error', 'Document not found or access denied')
      } else if (res.status === 401) {
        localStorage.removeItem('growfly_jwt')
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to access shared document:', error)
      showStatus('error', 'Failed to access shared document')
    }
  }, [router, showStatus])

  const handleAddComment = useCallback(async (text: string, from: number = 0, to: number = 0) => {
    if (!activeDoc) return
    
    const savedComment = await saveCommentToBackend(activeDoc.id, text, from, to)
    if (savedComment) {
      const comment: Comment = {
        id: savedComment.id,
        text: sanitizeInput(text),
        author: 'You',
        timestamp: new Date(),
        from,
        to,
        resolved: false,
        documentId: activeDoc.id,
        isRead: false
      }
      
      setComments(prev => [...prev, comment])
      showStatus('success', '💬 Comment added!')
    }
  }, [activeDoc, saveCommentToBackend, showStatus])

  const handleDeleteComment = useCallback(async (commentId: string) => {
    const success = await deleteCommentFromBackend(commentId)
    if (success) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      showStatus('success', '🗑️ Comment deleted')
    }
  }, [deleteCommentFromBackend, showStatus])

  // Load comments when active document changes
  useEffect(() => {
    if (activeDoc) {
      const token = localStorage.getItem('growfly_jwt')
      if (token && isValidToken(token)) {
        loadComments(activeDoc.id, token)
      }
    }
  }, [activeDoc, loadComments])

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) {
      router.push('/login')
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const sharedDocId = urlParams.get('doc')
    
    if (sharedDocId) {
      handleSharedDocumentAccess(sharedDocId, token)
    } else {
      loadDocuments(token)
    }
  }, [router, loadDocuments, handleSharedDocumentAccess])

  const unreadCommentsCount = comments.filter(c => c.documentId === activeDoc?.id && !c.isRead).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your documents...</p>
        </div>
      </div>
    )
  }

  if (isFullscreen && activeDoc) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col">
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
        
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900 p-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 h-full overflow-hidden">
            <Editor
              key={`fullscreen-${activeDoc.id}`}
              content={activeDoc.content}
              setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
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
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg font-medium ${
              statusMsg.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{statusMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
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
            <div className="flex-1 p-8 overflow-hidden">
              <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 h-full overflow-hidden">
                <Editor
                  key={activeDoc.id}
                  content={activeDoc.content}
                  setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
                  docId={activeDoc.id}
                  showComments={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Collab Zone
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create a new document or open an existing one to start collaborating.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleNewDoc}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create Document
                  </button>
                  <button
                    onClick={() => setShowDocuments(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Browse Documents
                  </button>
                </div>
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