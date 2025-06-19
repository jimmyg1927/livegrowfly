'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Edit3, Save, CheckCircle, AlertCircle, 
  FileText, Users, Search, Copy, Share2, Menu,
  ChevronUp, ChevronDown, Maximize2, MessageSquare, X,
  Palette, Download, Clock, Star, MoreHorizontal, 
  Zap, Grid3X3, LayoutList, Settings, Eye
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

// Google Docs Style Header
function GoogleDocsHeader({ 
  activeDoc, 
  onSave, 
  onShare, 
  onFullscreen, 
  onToggleComments, 
  showComments, 
  commentsCount 
}: {
  activeDoc: Doc | null
  onSave: () => void
  onShare: () => void
  onFullscreen: () => void
  onToggleComments: () => void
  showComments: boolean
  commentsCount: number
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

    // In a real implementation, you'd call an API to rename the document
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
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-4 py-3 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left: Document Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              {isRenaming && activeDoc ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                  autoFocus
                  maxLength={255}
                />
              ) : (
                <h1 
                  className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 px-2 py-1 rounded-xl transition-all truncate"
                  onClick={startRename}
                >
                  {activeDoc?.title || 'Untitled Document'}
                </h1>
              )}
              {activeDoc && (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                  Last edited {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        {activeDoc && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleComments}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 font-medium text-sm ${
                showComments
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
              {commentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {commentsCount}
                </span>
              )}
            </button>

            <button
              onClick={onFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium text-sm"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Download</span>
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-2xl hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold text-sm hover:scale-105 hover:shadow-xl active:scale-95"
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

// Bottom Document Drawer
function DocumentDrawer({ 
  isOpen, 
  onToggle, 
  docs, 
  activeDoc, 
  onSelectDoc, 
  onNewDoc, 
  onDeleteDoc 
}: {
  isOpen: boolean
  onToggle: () => void
  docs: Doc[]
  activeDoc: Doc | null
  onSelectDoc: (doc: Doc) => void
  onNewDoc: () => void
  onDeleteDoc: (id: string) => void
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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Bottom Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50 rounded-t-3xl shadow-2xl z-50 max-h-[85vh] md:max-h-[70vh] overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-4 md:p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Documents</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewDoc}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-200"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
              maxLength={100}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-2xl p-1">
            {[
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'shared', label: 'Shared', icon: Users },
              { id: 'all', label: 'All', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                  activeTab === id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <FileText className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your first document to get started</p>
              <button
                onClick={onNewDoc}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-medium text-sm"
              >
                Create Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group cursor-pointer p-3 md:p-4 rounded-2xl border transition-all duration-200 hover:scale-105 ${
                    activeDoc?.id === doc.id
                      ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-600 shadow-lg'
                      : 'border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-gray-300 dark:hover:border-slate-600 shadow-md hover:shadow-lg'
                  } backdrop-blur-sm`}
                  onClick={() => {
                    onSelectDoc(doc)
                    onToggle()
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 md:w-4 h-3 md:h-4 text-white" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteDoc(doc.id)
                        }}
                        className="p-1 md:p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-gray-400 hover:text-red-500 transition-all duration-200"
                      >
                        <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 truncate text-sm md:text-base">
                    {doc.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
                    {doc.isShared && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="hidden sm:inline">Shared</span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {doc.content.replace(/<[^>]*>/g, '').substring(0, 80) || 'No content yet...'}
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

// Google Docs Style Bottom Tab Bar
function BottomTabBar({ activeDoc, onToggleDrawer, onNewDoc, isAutoSaving, showComments }: {
  activeDoc: Doc | null
  onToggleDrawer: () => void
  onNewDoc: () => void
  isAutoSaving: boolean
  showComments: boolean
}) {
  return (
    <div className={`fixed bottom-0 left-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50 p-4 z-30 transition-all duration-300 ${
      showComments ? 'right-[350px]' : 'right-0'
    }`}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDrawer}
            className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">Documents</span>
          </button>
          
          {activeDoc && (
            <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 ${
              isAutoSaving 
                ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isAutoSaving 
                  ? 'bg-yellow-500 animate-pulse' 
                  : 'bg-green-500 animate-pulse'
              }`}></div>
              <span className={`text-sm font-medium ${
                isAutoSaving 
                  ? 'text-yellow-700 dark:text-yellow-300' 
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {isAutoSaving ? 'Saving...' : 'Auto-saved'}
              </span>
            </div>
          )}
        </div>

        {/* Center: Current Document - Hide on mobile when comments open */}
        {activeDoc && (
          <div className={`${showComments ? 'hidden lg:flex' : 'hidden md:flex'} items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-2xl`}>
            <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white truncate max-w-48">
              {activeDoc.title}
            </span>
          </div>
        )}

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewDoc}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-medium hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>
    </div>
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
      await onShare() // This will generate the link
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 p-8 w-full max-w-md z-50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            Share Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Anyone with the link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={isLoading ? "Generating link..." : "Share link will appear here"}
              />
              <button
                onClick={copyToClipboard}
                disabled={!shareLink}
                className={`px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  copySuccess
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Anyone with this link can view and edit the document
            </p>
          </div>

          {/* Email Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Share with specific people
            </label>
            <form onSubmit={handleEmailShare} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!email.trim() || isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sharing...' : 'Send Invitation'}
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              They'll receive access to collaborate on this document
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Comments Sidebar (Google Docs Style)
function CommentsSidebar({ 
  isVisible, 
  comments, 
  activeDocId, 
  onAddComment, 
  onDeleteComment 
}: {
  isVisible: boolean
  comments: Comment[]
  activeDocId: string | null
  onAddComment: (text: string, from?: number, to?: number) => void
  onDeleteComment: (id: string) => void
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
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: isVisible ? 350 : 0, opacity: isVisible ? 1 : 0 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 bottom-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 flex flex-col shadow-2xl z-30 overflow-hidden"
      style={{ width: isVisible ? '350px' : '0px' }}
    >
      <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-slate-700/50">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span>Comments</span>
          <span className="text-sm bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {docComments.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-6">
        {docComments.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Add the first comment below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {docComments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {comment.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{comment.author}</div>
                      <div className="text-sm text-gray-500">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-gray-400 hover:text-red-500 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {comment.from !== comment.to && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Comment on text selection (position {comment.from}-{comment.to})
                    </p>
                  </div>
                )}
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {comment.text}
                </p>

                {comment.resolved && (
                  <div className="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolved</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 lg:p-6 border-t border-gray-200/50 dark:border-slate-700/50 mb-16">
        <textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={handleCommentChange}
          className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          rows={3}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500">
            {newComment.length}/1000
          </span>
          <button 
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg disabled:cursor-not-allowed"
          >
            Comment
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function GoogleDocsCollabZone() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDrawer, setShowDrawer] = useState(false)
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
    }, 2000) // Auto-save after 2 seconds of inactivity

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
        setShowDrawer(false)
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
        
        // Remove the doc parameter from URL without page reload
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
    
    // Save to backend first
    const savedComment = await saveCommentToBackend(activeDoc.id, text, from, to)
    if (savedComment) {
      // Add to local state
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

    // Check if accessing a shared document
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your documents...</p>
        </div>
      </div>
    )
  }

  if (isFullscreen && activeDoc) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col">
        <GoogleDocsHeader 
          activeDoc={activeDoc}
          onSave={handleSave}
          onShare={() => setShowShareModal(true)}
          onFullscreen={() => setIsFullscreen(false)}
          onToggleComments={() => setShowComments(!showComments)}
          showComments={showComments}
          commentsCount={unreadCommentsCount}
        />
        
        <div className="flex-1 overflow-hidden flex">
          <div className={`${showComments ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            <div className="h-full p-4 lg:p-8 overflow-hidden">
              <div className="h-full max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="h-full overflow-y-auto p-6 lg:p-12 relative">
                  <Editor
                    key={`fullscreen-${activeDoc.id}`}
                    content={activeDoc.content}
                    setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
                    docId={activeDoc.id}
                    showComments={false}
                  />
                  
                  {/* Fullscreen placeholder */}
                  {!activeDoc.content && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center text-gray-400 dark:text-gray-500">
                        <FileText className="w-20 h-20 mx-auto mb-4 opacity-50" />
                        <p className="text-2xl font-medium mb-2">Focus Mode</p>
                        <p className="text-base">Start writing without distractions</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CommentsSidebar
            isVisible={showComments}
            comments={comments}
            activeDocId={activeDoc.id}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
      {/* Google Docs Header */}
      <GoogleDocsHeader 
        activeDoc={activeDoc}
        onSave={handleSave}
        onShare={() => setShowShareModal(true)}
        onFullscreen={() => setIsFullscreen(true)}
        onToggleComments={() => setShowComments(!showComments)}
        showComments={showComments}
        commentsCount={unreadCommentsCount}
      />

      {/* Status Messages */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm font-medium ${
              statusMsg.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{statusMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex">
        {/* Document Editor */}
        <div className={`${showComments ? 'flex-1' : 'w-full'} transition-all duration-300`}>
          {activeDoc ? (
            <div className="p-4 lg:p-8">
              <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 min-h-[80vh] group hover:shadow-3xl transition-all duration-300">
                <div className="p-6 lg:p-12">
                  <Editor
                    key={activeDoc.id}
                    content={activeDoc.content}
                    setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
                    docId={activeDoc.id}
                    showComments={false}
                  />
                  
                  {/* Placeholder when editor is empty */}
                  {!activeDoc.content && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center text-gray-400 dark:text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-xl font-medium mb-2">Start writing...</p>
                        <p className="text-sm">Click here to begin your document</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Welcome to Collab Zone
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Create a new document or open an existing one to start collaborating.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleNewDoc}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-semibold hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Create Document
                  </button>
                  <button
                    onClick={() => setShowDrawer(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
                  >
                    <FileText className="w-5 h-5" />
                    Browse Documents
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comments Sidebar */}
        <CommentsSidebar
          isVisible={showComments}
          comments={comments}
          activeDocId={activeDoc?.id || null}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        activeDoc={activeDoc}
        onToggleDrawer={() => setShowDrawer(true)}
        onNewDoc={handleNewDoc}
        isAutoSaving={isAutoSaving}
        showComments={showComments}
      />

      {/* Floating Documents Button - Only show when drawer is closed */}
      {!showDrawer && docs.length > 1 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => setShowDrawer(true)}
          className="fixed left-6 bottom-32 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 z-40 hover:scale-110 active:scale-95"
        >
          <FileText className="w-6 h-6" />
        </motion.button>
      )}

      {/* Document Drawer */}
      <DocumentDrawer
        isOpen={showDrawer}
        onToggle={() => setShowDrawer(!showDrawer)}
        docs={docs}
        activeDoc={activeDoc}
        onSelectDoc={setActiveDoc}
        onNewDoc={handleNewDoc}
        onDeleteDoc={handleDeleteDoc}
      />

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