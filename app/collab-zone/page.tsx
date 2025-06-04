'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Edit3, Save, Mail, CheckCircle, AlertCircle, Download, 
  Link, FileText, Users, Search, Filter, Copy, Eye, Share2, Clock,
  Star, MoreVertical, X, Settings, UserPlus, Globe
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
  sharedBy?: string
  isShared?: boolean
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  document: Doc | null
  onShare: (email: string, permission: string) => void
}

// Share Modal Component
function ShareModal({ isOpen, onClose, document, onShare }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('edit')
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (document && isOpen) {
      setShareLink(`${window.location.origin}/collab-zone?doc=${document.id}`)
    }
  }, [document, isOpen])

  const handleShare = () => {
    if (email.includes('@')) {
      onShare(email, permission)
      setEmail('')
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Document</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Share with specific people</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
            </div>
            <button
              onClick={handleShare}
              className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Invite
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Share with link</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  linkCopied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-500'
                }`}
              >
                {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Anyone with this link can view the document
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CollabZonePage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [sharedDocs, setSharedDocs] = useState<Doc[]>([])
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated')

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')
    loadDocuments(token)
  }, [router])

  const loadDocuments = async (token: string) => {
    setLoading(true)
    try {
      // Load owned documents
      const ownedRes = await fetch(`${API_URL}/api/collab`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const ownedDocs = await ownedRes.json()

      // Load shared documents
      const sharedRes = await fetch(`${API_URL}/api/collab/shared`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const sharedDocs = await sharedRes.json()

      if (Array.isArray(ownedDocs)) {
        setDocs(ownedDocs)
        if (!activeDoc && ownedDocs.length) setActiveDoc(ownedDocs[0])
      }

      if (Array.isArray(sharedDocs)) {
        setSharedDocs(sharedDocs.map((doc: any) => ({ ...doc, isShared: true })))
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setStatusMsg({ type: 'error', text: 'Failed to load documents' })
    } finally {
      setLoading(false)
    }
  }

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text })
    setTimeout(() => setStatusMsg(null), 3000)
  }

  const handleNew = async () => {
    const token = localStorage.getItem('growfly_jwt')!
    try {
      const res = await fetch(`${API_URL}/api/collab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'Untitled Document', content: '' }),
      })
      const created = await res.json()
      setDocs(prev => [created, ...prev])
      setActiveDoc(created)
      showStatus('success', 'New document created!')
    } catch (error) {
      showStatus('error', 'Failed to create document')
    }
  }

  const handleSave = async () => {
    if (!activeDoc) return
    const token = localStorage.getItem('growfly_jwt')!
    try {
      const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: activeDoc.content,
          title: activeDoc.title,
        }),
      })
      const updated = await res.json()
      setDocs(prev => prev.map(doc => doc.id === updated.id ? updated : doc))
      setActiveDoc(updated)
      showStatus('success', 'Document saved!')
    } catch (error) {
      showStatus('error', 'Failed to save document')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    const token = localStorage.getItem('growfly_jwt')!
    try {
      await fetch(`${API_URL}/api/collab/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDocs(prev => prev.filter(doc => doc.id !== id))
      if (activeDoc?.id === id) setActiveDoc(null)
      showStatus('success', 'Document deleted')
    } catch (error) {
      showStatus('error', 'Failed to delete document')
    }
  }

  const handleShare = async (email: string, permission: string) => {
    if (!activeDoc) return
    const token = localStorage.getItem('growfly_jwt')!
    try {
      const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, permission }),
      })

      if (res.ok) {
        showStatus('success', 'Document shared successfully!')
        setShowShareModal(false)
      } else {
        const { error } = await res.json()
        showStatus('error', error || 'Failed to share document')
      }
    } catch (error) {
      showStatus('error', 'Failed to share document')
    }
  }

  const handleRename = async (id: string) => {
    if (!newTitle.trim()) return
    const token = localStorage.getItem('growfly_jwt')!
    try {
      const res = await fetch(`${API_URL}/api/collab/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle }),
      })
      const updated = await res.json()
      setDocs(prev => prev.map(doc => doc.id === id ? updated : doc))
      if (activeDoc?.id === id) setActiveDoc(updated)
      setTitleEditId(null)
      showStatus('success', 'Document renamed!')
    } catch (error) {
      showStatus('error', 'Failed to rename document')
    }
  }

  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allDocs = [...filteredDocs, ...sharedDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  )]

  const sortedDocs = [...allDocs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'created':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Collab Zone</h1>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400'}`}
              >
                <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400'}`}
              >
                <div className="space-y-1 w-3 h-3">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent text-gray-600 dark:text-gray-400"
            >
              <option value="updated">Last updated</option>
              <option value="created">Date created</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : sortedDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm ? 'No documents found' : 'No documents yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNew}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Create your first document
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'}>
              {sortedDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  className={`group cursor-pointer rounded-lg border transition-all duration-200 ${
                    activeDoc?.id === doc.id
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                  } ${viewMode === 'grid' ? 'p-4' : 'p-3'}`}
                  onClick={() => setActiveDoc(doc)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {titleEditId === doc.id ? (
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(doc.id)
                            if (e.key === 'Escape') setTitleEditId(null)
                          }}
                          className="w-full px-2 py-1 text-sm border rounded"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {doc.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                        </span>
                        {doc.isShared && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                            <Users className="w-3 h-3" />
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!doc.isShared && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setTitleEditId(doc.id)
                            setNewTitle(doc.title)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(doc.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeDoc && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeDoc.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>

            {activeDoc && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Status Messages */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg ${
                statusMsg.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden">
          {activeDoc ? (
            <div className="h-full bg-white dark:bg-slate-800 m-6 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <Editor
                key={activeDoc.id}
                content={activeDoc.content}
                setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
                docId={activeDoc.id}
                showComments={true}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No document selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select a document from the sidebar or create a new one to get started.
                </p>
                <button
                  onClick={handleNew}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create New Document
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        document={activeDoc}
        onShare={handleShare}
      />
    </div>
  )
}