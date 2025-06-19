'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Edit3, Save, CheckCircle, AlertCircle, 
  FileText, Users, Search, Copy, Share2,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, MessageSquare, X,
  Palette, Type, AlignLeft, AlignCenter, AlignRight, Download, Printer,
  Bold, Italic, Underline, List, ListOrdered, Quote, Code,
  Zap, FileDown, Menu, Grid3X3, LayoutList, Filter, SortAsc,
  Eye, Clock, Star, MoreHorizontal, FolderOpen, Bookmark
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

// Compact Skeleton Loader
function DocumentSkeleton() {
  return (
    <div className="animate-pulse p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl border border-gray-200/50 dark:border-slate-600/50">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded-lg mb-2"></div>
      <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded w-3/4"></div>
    </div>
  )
}

// Compact Formatting Toolbar
function FormattingToolbar({ isVisible, onClose, activeDoc }: { 
  isVisible: boolean
  onClose: () => void 
  activeDoc: Doc | null
}) {
  const [wordCount, setWordCount] = useState(0)
  
  useEffect(() => {
    if (activeDoc?.content) {
      const text = activeDoc.content.replace(/<[^>]*>/g, '').trim()
      const words = text.split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
    }
  }, [activeDoc?.content])

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!activeDoc) return
    const content = activeDoc.content.replace(/<[^>]*>/g, '')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeDoc.title}.${format === 'docx' ? 'doc' : format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 z-50 mx-4 mt-2"
    >
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-slate-600/50 rounded-2xl shadow-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Format & Export</h4>
              {activeDoc && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{wordCount} words</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Text Formatting */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Type className="w-3 h-3" />
              Style
            </h5>
            
            <div className="flex gap-1">
              {[Bold, Italic, Underline].map((Icon, index) => (
                <button key={index} className="p-2 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 rounded-xl text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 transition-all duration-200 hover:scale-105">
                  <Icon className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" />
              Layout
            </h5>
            
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: List, label: 'List' },
                { icon: Quote, label: 'Quote' }
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border border-blue-200 dark:border-blue-800 transition-all duration-200 hover:scale-105">
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileDown className="w-3 h-3" />
              Export
            </h5>
            
            <div className="space-y-1">
              {[
                { action: () => handleExport('pdf'), icon: FileDown, title: 'PDF' },
                { action: () => handleExport('docx'), icon: FileText, title: 'Word' }
              ].map(({ action, icon: Icon, title }) => (
                <button 
                  key={title}
                  onClick={action}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 border border-green-200 dark:border-green-800 transition-all duration-200 hover:scale-105 text-xs"
                >
                  <Icon className="w-3 h-3" />
                  <span>{title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Compact Template Modal
function TemplateModal({ isOpen, onClose, onCreateFromTemplate }: {
  isOpen: boolean
  onClose: () => void
  onCreateFromTemplate: (template: string) => void
}) {
  const templates = [
    {
      id: 'blank',
      name: 'Blank',
      description: 'Empty document',
      icon: FileText,
      content: ''
    },
    {
      id: 'meeting',
      name: 'Meeting',
      description: 'Meeting notes',
      icon: Users,
      content: `<h2>Meeting Notes</h2><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Attendees:</strong> </p><h3>Discussion</h3><h3>Action Items</h3>`
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200/50 dark:border-slate-600/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Templates</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const IconComponent = template.icon
            return (
              <button
                key={template.id}
                onClick={() => {
                  onCreateFromTemplate(template.content)
                  onClose()
                }}
                className="p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-900/30 transition-all duration-200 hover:scale-105 text-left"
              >
                <IconComponent className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

// Compact Share Modal
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-slate-600/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
            </div>
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm"
            >
              Send
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-xs"
              />
              <button
                onClick={copyLink}
                className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                  linkCopied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-500'
                }`}
              >
                {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
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
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated')
  const [activeTab, setActiveTab] = useState<'my-docs' | 'shared' | 'recent'>('my-docs')
  
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFormatToolbar, setShowFormatToolbar] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<Array<{
    id: string
    text: string
    author: string
    timestamp: Date
    selectedText?: string
    documentId?: string
    isRead?: boolean
  }>>([])
  const [newComment, setNewComment] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)

  const getUnreadCount = (docId: string) => {
    return comments.filter(c => c.documentId === docId && !c.isRead).length
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowCommentForm(true)
      setCommentsVisible(true)
    }
  }

  const addComment = () => {
    if (!newComment.trim() || !activeDoc) return
    
    const comment = {
      id: `comment_${Date.now()}`,
      text: newComment,
      author: 'You',
      timestamp: new Date(),
      selectedText: selectedText || undefined,
      documentId: activeDoc.id,
      isRead: false
    }
    
    setComments(prev => [...prev, comment])
    setNewComment('')
    setSelectedText('')
    setShowCommentForm(false)
  }

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const loadDocuments = async (token: string) => {
    setLoading(true)
    try {
      const ownedRes = await fetch(`${API_URL}/api/collab`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (ownedRes.ok) {
        const ownedDocs = await ownedRes.json()
        if (Array.isArray(ownedDocs)) {
          setDocs(ownedDocs)
          if (!activeDoc && ownedDocs.length) setActiveDoc(ownedDocs[0])
        }
      }

      try {
        const sharedRes = await fetch(`${API_URL}/api/collab/shared`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (sharedRes.ok) {
          const sharedDocsData = await sharedRes.json()
          if (Array.isArray(sharedDocsData)) {
            setSharedDocs(sharedDocsData.map((doc: Doc) => ({ ...doc, isShared: true })))
          }
        }
      } catch (sharedError) {
        setSharedDocs([])
      }
      
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Failed to load documents' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')
    loadDocuments(token)
  }, [router])

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
        body: JSON.stringify({ title: 'Untitled', content: '' }),
      })
      const created = await res.json()
      setDocs(prev => [created, ...prev])
      setActiveDoc(created)
      showStatus('success', '✨ New document created!')
    } catch (error) {
      showStatus('error', 'Failed to create document')
    }
  }

  const handleCreateFromTemplate = async (templateContent: string) => {
    const token = localStorage.getItem('growfly_jwt')!
    try {
      const res = await fetch(`${API_URL}/api/collab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'New Document', content: templateContent }),
      })
      const created = await res.json()
      setDocs(prev => [created, ...prev])
      setActiveDoc(created)
      showStatus('success', '✨ Document created!')
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
      showStatus('success', '💾 Document saved!')
    } catch (error) {
      showStatus('error', 'Failed to save document')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    const token = localStorage.getItem('growfly_jwt')!
    try {
      await fetch(`${API_URL}/api/collab/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setDocs(prev => prev.filter(doc => doc.id !== id))
      if (activeDoc?.id === id) setActiveDoc(null)
      showStatus('success', '🗑️ Document deleted')
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
        showStatus('success', '🚀 Document shared!')
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
      showStatus('success', '✏️ Document renamed!')
    } catch (error) {
      showStatus('error', 'Failed to rename document')
    }
  }

  const getDocumentsByTab = () => {
    const filteredDocs = docs.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const allFilteredDocs = [...filteredDocs, ...sharedDocs.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )]

    switch (activeTab) {
      case 'my-docs':
        return filteredDocs
      case 'shared':
        return sharedDocs.filter(doc =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      case 'recent':
        return allFilteredDocs.slice(0, 10)
      default:
        return allFilteredDocs
    }
  }

  const sortedDocs = [...getDocumentsByTab()].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  if (isFullscreen && activeDoc) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-50 flex flex-col">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {activeDoc.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommentsVisible(!commentsVisible)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                commentsVisible 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          <div className={`${commentsVisible ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            <div className="h-full p-4 overflow-hidden">
              <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg">
                <div className="h-full overflow-y-auto p-4" onMouseUp={handleTextSelection}>
                  <Editor
                    key={`fullscreen-${activeDoc.id}`}
                    content={activeDoc.content}
                    setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
                    docId={activeDoc.id}
                    showComments={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {commentsVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </h3>
                  <button onClick={() => setCommentsVisible(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {comments.filter(c => c.documentId === activeDoc.id).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Select text to comment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.filter(c => c.documentId === activeDoc.id).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 border border-gray-200 dark:border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {comment.author.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</span>
                            <span className="text-xs text-gray-500">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</span>
                          </div>
                          <button onClick={() => deleteComment(comment.id)} className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {comment.selectedText && (
                          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">&ldquo;{comment.selectedText}&rdquo;</p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50">
                {showCommentForm && selectedText && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">&ldquo;{selectedText}&rdquo;</p>
                  </div>
                )}
                
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button 
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  Comment
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Compact Sidebar */}
      <aside className={`${
        sidebarCollapsed ? 'w-16' : 'w-80'
      } bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 flex flex-col transition-all duration-300 shadow-lg`}>
        
        <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white">Collab Zone</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Collaborative writing</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              {!sidebarCollapsed && (
                <div className="flex gap-1">
                  <button
                    onClick={handleNew}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-xs font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    New
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="p-1.5 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:from-purple-200 hover:to-indigo-200 transition-all duration-200"
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-slate-700 rounded-xl p-0.5">
                {[
                  { id: 'my-docs', label: 'My Docs', icon: FileText },
                  { id: 'shared', label: 'Shared', icon: Users },
                  { id: 'recent', label: 'Recent', icon: Clock }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <LayoutList className="w-3 h-3" />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg px-2 py-1 border-0 focus:outline-none"
                >
                  <option value="updated">Recent</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))}
              </div>
            ) : sortedDocs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  {searchTerm ? 'No documents found' : 'No documents yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleNew}
                    className="text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Create your first document
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group cursor-pointer rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeDoc?.id === doc.id
                        ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-600'
                        : 'border-gray-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 hover:border-gray-300 dark:hover:border-slate-500'
                    } p-3 backdrop-blur-sm hover:scale-[1.01]`}
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
                            className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
                            autoFocus
                          />
                        ) : (
                          <div className="relative">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm pr-4 mb-1">
                              {doc.title}
                            </h3>
                            {getUnreadCount(doc.id) > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {getUnreadCount(doc.id)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                          </span>
                          {doc.isShared && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                              <Users className="w-2 h-2" />
                              Shared
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!doc.isShared && (
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTitleEditId(doc.id)
                              setNewTitle(doc.title)
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(doc.id)
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
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
        )}

        {sidebarCollapsed && (
          <div className="p-3">
            <button
              onClick={handleNew}
              className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center justify-center"
              title="New Document"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-4 py-3 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {activeDoc && (
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {activeDoc.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>

            {activeDoc && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFormatToolbar(!showFormatToolbar)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                    showFormatToolbar 
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Format</span>
                </button>

                <button
                  onClick={() => setCommentsVisible(!commentsVisible)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 relative text-sm ${
                    commentsVisible 
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Comments</span>
                  {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 text-sm"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Full</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg font-medium text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            )}
          </div>
          
          <FormattingToolbar 
            isVisible={showFormatToolbar} 
            onClose={() => setShowFormatToolbar(false)}
            activeDoc={activeDoc}
          />
        </header>

        {/* Status Messages */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className={`mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm text-sm ${
                statusMsg.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="font-medium">{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className={`${commentsVisible ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            {activeDoc ? (
              <div className="h-full p-4 overflow-hidden">
                <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg">
                  <div className="h-full overflow-y-auto p-4" onMouseUp={handleTextSelection}>
                    <Editor
                      key={activeDoc.id}
                      content={activeDoc.content}
                      setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
                      docId={activeDoc.id}
                      showComments={false}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center max-w-md">
                  <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl mb-4 inline-block">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No document selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Select a document from the sidebar or create a new one.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleNew}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Document
                    </button>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:from-purple-200 hover:to-indigo-200 transition-all duration-200 border border-purple-200 dark:border-purple-800 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Templates
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compact Comments Panel */}
          {commentsVisible && activeDoc && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </h3>
                  <button onClick={() => setCommentsVisible(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {comments.filter(c => c.documentId === activeDoc.id).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No comments</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Select text to comment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.filter(c => c.documentId === activeDoc.id).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 border border-gray-200 dark:border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {comment.author.charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</span>
                              <p className="text-xs text-gray-500">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</p>
                            </div>
                          </div>
                          <button onClick={() => deleteComment(comment.id)} className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {comment.selectedText && (
                          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">&ldquo;{comment.selectedText}&rdquo;</p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50">
                {showCommentForm && selectedText && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">&ldquo;{selectedText}&rdquo;</p>
                  </div>
                )}
                
                <textarea
                  placeholder="Add comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button 
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  Comment
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        document={activeDoc}
        onShare={handleShare}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onCreateFromTemplate={handleCreateFromTemplate}
      />
    </div>
  )
}