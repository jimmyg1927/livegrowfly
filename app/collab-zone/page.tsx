'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Edit3, Save, CheckCircle, AlertCircle, 
  FileText, Users, Search, Copy, Share2,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, MessageSquare, X,
  Palette, Type, AlignLeft, AlignCenter, AlignRight, Download, Printer,
  Bold, Italic, Underline, List, ListOrdered, Quote, Code,
  Zap, FileDown
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

// Enhanced Formatting Toolbar Component
function FormattingToolbar({ isVisible, onClose, activeDoc }: { 
  isVisible: boolean
  onClose: () => void 
  activeDoc: Doc | null
}) {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedFontSize, setSelectedFontSize] = useState('16')
  const [wordCount, setWordCount] = useState(0)
  
  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', 
    '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'
  ]
  
  const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48']

  // Count words in document
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

  const handlePrint = () => {
    if (!activeDoc) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${activeDoc.title}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6;">
            <h1>${activeDoc.title}</h1>
            <div>${activeDoc.content}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl p-4 mt-2 max-w-4xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Format & Export</h4>
          {activeDoc && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>Last saved {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Formatting */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text Style
          </h5>
          
          {/* Quick Format Buttons */}
          <div className="flex gap-1">
            <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
              <Underline className="w-4 h-4" />
            </button>
          </div>
          
          {/* Font Size */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Font Size</label>
            <select 
              value={selectedFontSize}
              onChange={(e) => setSelectedFontSize(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
            >
              {fontSizes.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          {/* Text Color */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Text Color</label>
            <div className="grid grid-cols-5 gap-1 mb-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-gray-400 scale-110 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-8 rounded border border-gray-200 dark:border-slate-600"
            />
          </div>
        </div>

        {/* Layout & Structure */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <AlignLeft className="w-4 h-4" />
            Layout
          </h5>
          
          {/* Alignment */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Text Alignment</label>
            <div className="flex gap-1">
              <button className="flex-1 p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
                <AlignLeft className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
                <AlignCenter className="w-4 h-4 mx-auto" />
              </button>
              <button className="flex-1 p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Quick Elements */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Quick Insert</label>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <List className="w-3 h-3" />
                List
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800">
                <ListOrdered className="w-3 h-3" />
                Numbers
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                <Quote className="w-3 h-3" />
                Quote
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
                <Code className="w-3 h-3" />
                Code
              </button>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export & Print
          </h5>
          
          {/* Export Options */}
          <div className="space-y-2">
            <button 
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Export as PDF</div>
                <div className="text-xs opacity-70">Download document as PDF</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleExport('docx')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Export as Word</div>
                <div className="text-xs opacity-70">Download as .doc file</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleExport('txt')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 border border-gray-200 dark:border-gray-800 transition-colors"
            >
              <Type className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Export as Text</div>
                <div className="text-xs opacity-70">Plain text format</div>
              </div>
            </button>
            
            <button 
              onClick={handlePrint}
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Print Document</div>
                <div className="text-xs opacity-70">Print or save as PDF</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Template Modal Component
function TemplateModal({ isOpen, onClose, onCreateFromTemplate }: {
  isOpen: boolean
  onClose: () => void
  onCreateFromTemplate: (template: string) => void
}) {
  const templates = [
    {
      id: 'blank',
      name: 'Blank Document',
      description: 'Start with an empty document',
      icon: FileText,
      content: ''
    },
    {
      id: 'meeting',
      name: 'Meeting Notes',
      description: 'Template for meeting minutes',
      icon: Users,
      content: `
        <h1>Meeting Notes</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Attendees:</strong> </p>
        <p><strong>Agenda:</strong></p>
        <ul>
          <li></li>
          <li></li>
        </ul>
        <h2>Discussion</h2>
        <h2>Action Items</h2>
        <ul>
          <li></li>
        </ul>
        <h2>Next Meeting</h2>
      `
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Template</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const IconComponent = template.icon
            return (
              <button
                key={template.id}
                onClick={() => {
                  onCreateFromTemplate(template.content)
                  onClose()
                }}
                className="p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <IconComponent className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{template.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
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
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
            </div>
            <button
              onClick={handleShare}
              className="w-full mt-2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors"
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
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-xl transition-colors ${
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
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated')
  
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commentsVisible, setCommentsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFormatToolbar, setShowFormatToolbar] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<Array<{
    id: string
    text: string
    author: string
    timestamp: Date
    position?: { x: number; y: number }
    selectedText?: string
    documentId?: string
    isRead?: boolean
  }>>([])
  const [newComment, setNewComment] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [highlightedTextId, setHighlightedTextId] = useState<string | null>(null)

  // Track document view time for auto-read
  useEffect(() => {
    if (!activeDoc) return
    
    const startTime = Date.now()
    const timer = setTimeout(() => {
      setComments(prev => prev.map(comment => 
        comment.documentId === activeDoc.id ? { ...comment, isRead: true } : comment
      ))
    }, 5000)

    return () => {
      clearTimeout(timer)
      const viewTime = Date.now() - startTime
      if (viewTime > 0) {
        // Document viewing time tracked
      }
    }
  }, [activeDoc?.id])

  const getUnreadCount = (docId: string) => {
    return comments.filter(c => c.documentId === docId && !c.isRead).length
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      const range = selection.getRangeAt(0)
      
      const highlightId = `highlight_${Date.now()}`
      
      try {
        const span = document.createElement('span')
        span.className = 'comment-highlight'
        span.id = highlightId
        span.style.backgroundColor = '#3b82f6'
        span.style.color = 'white'
        span.style.padding = '2px 4px'
        span.style.borderRadius = '4px'
        span.style.fontWeight = '500'
        
        range.surroundContents(span)
        selection.removeAllRanges()
        
        setSelectedText(selectedText)
        setHighlightedTextId(highlightId)
        setShowCommentForm(true)
        setCommentsVisible(true)
      } catch (error) {
        setSelectedText(selectedText)
        setShowCommentForm(true)
        setCommentsVisible(true)
      }
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
    
    if (highlightedTextId) {
      const highlightElement = document.getElementById(highlightedTextId)
      if (highlightElement) {
        highlightElement.style.backgroundColor = '#10b981'
        highlightElement.style.cursor = 'pointer'
        highlightElement.title = 'This text has a comment'
      }
    }
    setHighlightedTextId(null)
  }

  const cancelComment = () => {
    if (highlightedTextId) {
      const highlightElement = document.getElementById(highlightedTextId)
      if (highlightElement) {
        const parent = highlightElement.parentNode
        if (parent) {
          parent.replaceChild(document.createTextNode(highlightElement.textContent || ''), highlightElement)
          parent.normalize()
        }
      }
    }
    
    setShowCommentForm(false)
    setSelectedText('')
    setNewComment('')
    setHighlightedTextId(null)
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
        } else if (sharedRes.status === 404) {
          setSharedDocs([])
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
      showStatus('success', 'Document created from template!')
    } catch (error) {
      showStatus('error', 'Failed to create document')
    }
  }

  const handleDuplicate = async (doc: Doc) => {
    const token = localStorage.getItem('growfly_jwt')!
    try {
      const res = await fetch(`${API_URL}/api/collab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: `${doc.title} (Copy)`, content: doc.content }),
      })
      const created = await res.json()
      setDocs(prev => [created, ...prev])
      showStatus('success', 'Document duplicated!')
    } catch (error) {
      showStatus('error', 'Failed to duplicate document')
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

  if (isFullscreen && activeDoc) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col">
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 lg:px-6 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs lg:max-w-md">
                {activeDoc.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => setShowFormatToolbar(!showFormatToolbar)}
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                showFormatToolbar 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
              title="Format & Export"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden xl:inline">Format</span>
            </button>

            <button
              onClick={() => setCommentsVisible(!commentsVisible)}
              className={`flex items-center gap-2 px-2 lg:px-3 py-2 rounded-xl transition-colors ${
                commentsVisible 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
              title="Toggle Comments"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden lg:inline">{commentsVisible ? 'Hide' : 'Show'}</span>
              {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden lg:inline">Share</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden lg:inline">Save</span>
            </button>
          </div>
          
          <FormattingToolbar 
            isVisible={showFormatToolbar} 
            onClose={() => setShowFormatToolbar(false)}
            activeDoc={activeDoc}
          />
        </header>

        <div className="flex-1 overflow-hidden flex">
          <div className={`${commentsVisible ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            <div className="h-full p-4 lg:p-6 overflow-hidden">
              <div className="h-full bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
                <div className="h-full overflow-y-auto" onMouseUp={handleTextSelection}>
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
              className="bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </h3>
                  <button
                    onClick={() => setCommentsVisible(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {comments.filter(c => c.documentId === activeDoc.id).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No comments yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Select text to add comments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.filter(c => c.documentId === activeDoc.id).map((comment) => (
                      <div key={comment.id} className={`bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border ${comment.isRead ? 'border-gray-200 dark:border-slate-600' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                            </span>
                            {!comment.isRead && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {comment.selectedText && (
                          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              &ldquo;{comment.selectedText}&rdquo;
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                {showCommentForm && selectedText && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected text:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">&ldquo;{selectedText}&rdquo;</p>
                  </div>
                )}
                
                <textarea
                  placeholder={selectedText ? "Add a comment about the selected text..." : "Add a general comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  {showCommentForm && (
                    <button 
                      onClick={cancelComment}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    {selectedText ? 'Add Comment' : 'Comment'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300 shadow-sm`}>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Collab Zone</h1>
            )}
            <div className="flex items-center gap-2">
              {!sidebarCollapsed && (
                <div className="flex gap-1">
                  <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    title="Templates"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
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
                    className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <div className="space-y-1 w-3 h-3">
                      <div className="bg-current h-0.5 rounded-xl"></div>
                      <div className="bg-current h-0.5 rounded-xl"></div>
                      <div className="bg-current h-0.5 rounded-xl"></div>
                    </div>
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
                  className="text-xs bg-transparent text-gray-600 dark:text-gray-400 rounded-xl focus:outline-none"
                >
                  <option value="updated">Last updated</option>
                  <option value="created">Date created</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
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
                    className={`group cursor-pointer rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
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
                            className="w-full px-2 py-1 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <div className="relative">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm pr-6">
                              {doc.title}
                            </h3>
                            {getUnreadCount(doc.id) > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                {getUnreadCount(doc.id)}
                              </span>
                            )}
                          </div>
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
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicate(doc)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-xl"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTitleEditId(doc.id)
                              setNewTitle(doc.title)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(doc.id)
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-xl"
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
          <div className="p-4">
            <button
              onClick={handleNew}
              className="w-full p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
              title="New Document"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 lg:px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeDoc && (
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                    {activeDoc.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>

            {activeDoc && (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <button
                  onClick={() => setShowFormatToolbar(!showFormatToolbar)}
                  className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                    showFormatToolbar 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                  title="Format & Export"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden xl:inline">Format</span>
                </button>

                <button
                  onClick={() => setCommentsVisible(!commentsVisible)}
                  className={`flex items-center gap-2 px-2 lg:px-3 py-2 rounded-xl transition-colors ${
                    commentsVisible 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                  title="Toggle Comments"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline lg:inline">{commentsVisible ? 'Hide' : 'Show'}</span>
                  <span className="sm:hidden lg:hidden">Comments</span>
                  {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Fullscreen</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Share</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
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

        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`mx-4 lg:mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl shadow-sm ${
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

        <div className="flex-1 overflow-hidden flex">
          <div className={`${commentsVisible ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            {activeDoc ? (
              <div className="h-full bg-white dark:bg-slate-800 m-4 lg:m-6 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
                <div className="h-full overflow-y-auto" onMouseUp={handleTextSelection}>
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
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No document selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Select a document from the sidebar or create a new one to get started.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleNew}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Document
                    </button>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      From Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {commentsVisible && activeDoc && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </h3>
                  <button
                    onClick={() => setCommentsVisible(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {comments.filter(c => c.documentId === activeDoc.id).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No comments yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Select text in the document to add comments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.filter(c => c.documentId === activeDoc.id).map((comment) => (
                      <div key={comment.id} className={`bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border transition-colors ${comment.isRead ? 'border-gray-200 dark:border-slate-600' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                            </span>
                            {!comment.isRead && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {comment.selectedText && (
                          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              &ldquo;{comment.selectedText}&rdquo;
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                {showCommentForm && selectedText && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected text:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">&ldquo;{selectedText}&rdquo;</p>
                  </div>
                )}
                
                <textarea
                  placeholder={selectedText ? "Add a comment about the selected text..." : "Add a general comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  {showCommentForm && (
                    <button 
                      onClick={cancelComment}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto shadow-sm"
                  >
                    {selectedText ? 'Add Comment' : 'Comment'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

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