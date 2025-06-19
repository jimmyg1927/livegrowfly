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

// Main Document Header - Modern and Friendly
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
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4 z-30 sticky top-0 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Document Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleDocuments}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
              showDocuments 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
          </button>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-slate-600" />

          {activeDoc && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              
              {isRenaming ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  className="text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white min-w-0 focus:text-blue-600 dark:focus:text-blue-400"
                  autoFocus
                  maxLength={255}
                />
              ) : (
                <div className="min-w-0">
                  <h1 
                    className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 px-3 py-2 rounded-xl transition-all truncate hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={startRename}
                  >
                    {activeDoc.title}
                  </h1>
                  <div className="flex items-center gap-2 px-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                    </span>
                    {isAutoSaving && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse shadow-sm" />
                          <span className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Saving...</span>
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
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleComments}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold hover:scale-105 ${
                showComments
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
              {commentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {commentsCount}
                </span>
              )}
            </button>

            <button
              onClick={onFullscreen}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 text-sm font-semibold hover:scale-105"
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
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 text-sm font-semibold hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Download</span>
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:scale-105"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={onSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-bold shadow-lg shadow-blue-500/25 hover:scale-105"
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

// Documents Sidebar - Modern Left Panel
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
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Documents</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewDoc}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-xl transition-all duration-300 lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              maxLength={100}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-1.5">
            {[
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'shared', label: 'Shared', icon: Users },
              { id: 'all', label: 'All', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-all duration-300 text-xs ${
                  activeTab === id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No documents found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">Create your first document to get started on your next project</p>
              <button
                onClick={onNewDoc}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg shadow-blue-500/25 hover:scale-105"
              >
                Create Document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    activeDoc?.id === doc.id
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800 shadow-lg shadow-blue-500/10'
                      : 'border-gray-200/50 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 hover:shadow-lg hover:shadow-blue-500/5'
                  }`}
                  onClick={() => onSelectDoc(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteDoc(doc.id)
                        }}
                        className="p-2 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-lg text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 truncate">
                    {doc.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
                    {doc.isShared && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg">
                          <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Shared</span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {doc.content.replace(/<[^>]*>/g, '').substring(0, 80) || 'No content yet...'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 text-sm font-semibold"
          >
            <Sidebar className="w-4 h-4" />
            <span>Collapse Sidebar</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}

// Comments Sidebar - Modern Right Panel
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

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        exit={{ x: 320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Comments</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-semibold">
                    {docComments.length} {docComments.length === 1 ? 'comment' : 'comments'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-xl transition-all duration-300 lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {docComments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No comments yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Start a conversation by adding the first comment below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {docComments.map((comment) => (
                <motion.div 
                  key={comment.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{comment.author}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-2 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-lg text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {comment.from !== comment.to && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold italic">
                        💬 Commented on text selection (position {comment.from}-{comment.to})
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-slate-900/30 rounded-xl p-3">
                    {comment.text}
                  </p>

                  {comment.resolved && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg px-3 py-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>✅ Resolved</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
            <textarea
              placeholder="Add a thoughtful comment..."
              value={newComment}
              onChange={handleCommentChange}
              className="w-full p-4 border-0 bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400 leading-relaxed"
              rows={3}
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/30 dark:border-slate-700/30">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {newComment.length}/1000 characters
              </span>
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-500/25 hover:scale-105 disabled:transform-none"
              >
                💬 Comment
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Share Modal Component - Modern and Friendly
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 p-8 w-full max-w-lg z-50"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Share Document</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Collaborate with others in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-xl transition-all duration-300 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Share Link */}
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200/20 dark:border-blue-800/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-900 dark:text-white">Anyone with the link</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share this link to give access to your document</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none text-sm font-mono"
                placeholder={isLoading ? "✨ Generating magical link..." : "Share link will appear here"}
              />
              <button
                onClick={copyToClipboard}
                disabled={!shareLink}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  copySuccess
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copySuccess && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-3 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Link copied to clipboard!
              </motion.p>
            )}
          </div>

          {/* Email Share */}
          <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-purple-200/20 dark:border-purple-800/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-900 dark:text-white">Share with specific people</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send a direct invitation via email</p>
              </div>
            </div>
            <form onSubmit={handleEmailShare} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!email.trim() || isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-purple-500/25 hover:scale-[1.02] disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending invitation...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Invitation</span>
                  </div>
                )}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200/30 border-t-blue-600 rounded-full mx-auto mb-6"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
              Loading your workspace...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Preparing your documents and collaboration tools ✨</p>
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
          <div className="max-w-5xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 h-full overflow-hidden">
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
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold shadow-2xl backdrop-blur-md ${
              statusMsg.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white border border-emerald-400/50'
                : 'bg-gradient-to-r from-red-500/90 to-pink-600/90 text-white border border-red-400/50'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
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
              <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 h-full overflow-hidden">
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
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md mx-auto">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", damping: 25, stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/25"
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
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Create Document
                  </button>
                  <button
                    onClick={() => setShowDocuments(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:from-gray-200 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 font-bold border border-gray-200/50 dark:border-slate-600/50 hover:scale-105"
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