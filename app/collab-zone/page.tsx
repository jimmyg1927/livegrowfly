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

// Modern Skeleton Loader Component
function DocumentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 h-32 rounded-2xl mb-4"></div>
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 h-4 rounded-xl w-3/4"></div>
        <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 h-3 rounded-xl w-1/2"></div>
      </div>
    </div>
  )
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
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 z-50 mx-4"
    >
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-slate-600/50 rounded-3xl shadow-2xl p-8 mt-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Format & Export</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize your document</p>
              </div>
            </div>
            {activeDoc && (
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{wordCount} words</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Saved {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Text Formatting */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-600">
              <Type className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Text Style</h5>
            </div>
            
            <div className="flex gap-3">
              {[Bold, Italic, Underline].map((Icon, index) => (
                <button key={index} className="p-4 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 rounded-2xl text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Font Size</label>
              <select 
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(e.target.value)}
                className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block">Text Color</label>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-2xl border-2 transition-all duration-200 hover:scale-110 ${
                      selectedColor === color 
                        ? 'border-gray-400 scale-110 shadow-xl ring-4 ring-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full h-12 rounded-2xl border border-gray-200 dark:border-slate-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Layout & Structure */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-600">
              <AlignLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Layout</h5>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Text Alignment</label>
              <div className="grid grid-cols-3 gap-2">
                {[AlignLeft, AlignCenter, AlignRight].map((Icon, index) => (
                  <button key={index} className="p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-2xl text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 transition-all duration-200 hover:scale-105">
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block">Quick Insert</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: List, label: 'List', color: 'blue' },
                  { icon: ListOrdered, label: 'Numbers', color: 'green' },
                  { icon: Quote, label: 'Quote', color: 'purple' },
                  { icon: Code, label: 'Code', color: 'gray' }
                ].map(({ icon: Icon, label, color }) => (
                  <button key={label} className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/30 text-${color}-700 dark:text-${color}-300 rounded-2xl text-sm hover:from-${color}-100 hover:to-${color}-200 dark:hover:from-${color}-900/30 dark:hover:to-${color}-900/40 border border-${color}-200 dark:border-${color}-800 transition-all duration-200 hover:scale-105 hover:shadow-lg`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export & Actions */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-600">
              <FileDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Export & Print</h5>
            </div>
            
            <div className="space-y-4">
              {[
                { action: () => handleExport('pdf'), icon: FileDown, title: 'Export as PDF', desc: 'Download as PDF file', color: 'red' },
                { action: () => handleExport('docx'), icon: FileText, title: 'Export as Word', desc: 'Download as .doc file', color: 'blue' },
                { action: () => handleExport('txt'), icon: Type, title: 'Export as Text', desc: 'Plain text format', color: 'gray' },
                { action: () => {}, icon: Printer, title: 'Print Document', desc: 'Print or save as PDF', color: 'green' }
              ].map(({ action, icon: Icon, title, desc, color }) => (
                <button 
                  key={title}
                  onClick={action}
                  className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/30 text-${color}-700 dark:text-${color}-300 rounded-2xl hover:from-${color}-100 hover:to-${color}-200 dark:hover:from-${color}-900/30 dark:hover:to-${color}-900/40 border border-${color}-200 dark:border-${color}-800 transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className={`p-3 bg-${color}-500 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{title}</div>
                    <div className="text-xs opacity-80">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
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
      content: '',
      color: 'blue'
    },
    {
      id: 'meeting',
      name: 'Meeting Notes',
      description: 'Template for meeting minutes',
      icon: Users,
      content: `<h1>Meeting Notes</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Attendees:</strong> </p><p><strong>Agenda:</strong></p><ul><li></li><li></li></ul><h2>Discussion</h2><h2>Action Items</h2><ul><li></li></ul><h2>Next Meeting</h2>`,
      color: 'purple'
    },
    {
      id: 'project',
      name: 'Project Plan',
      description: 'Structured project planning template',
      icon: FolderOpen,
      content: `<h1>Project Plan</h1><h2>Overview</h2><p>Project description and objectives...</p><h2>Timeline</h2><h2>Resources</h2><h2>Milestones</h2>`,
      color: 'green'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-4xl shadow-2xl border border-gray-200/50 dark:border-slate-600/50"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Template</h3>
              <p className="text-gray-600 dark:text-gray-400">Start with a pre-designed template</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => {
            const IconComponent = template.icon
            return (
              <button
                key={template.id}
                onClick={() => {
                  onCreateFromTemplate(template.content)
                  onClose()
                }}
                className={`group p-6 border border-gray-200 dark:border-slate-600 rounded-2xl hover:border-${template.color}-300 dark:hover:border-${template.color}-600 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 hover:from-${template.color}-50 hover:to-${template.color}-100 dark:hover:from-${template.color}-900/20 dark:hover:to-${template.color}-900/30 transition-all duration-200 hover:scale-105 hover:shadow-xl text-left`}
              >
                <div className={`p-4 bg-gradient-to-br from-${template.color}-500 to-${template.color}-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-slate-600/50"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Document</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Collaborate with others</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Share with specific people</h4>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              >
                <option value="view">Can View</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>
            <button
              onClick={handleShare}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Send Invite
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Share with link</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-3 rounded-2xl transition-all duration-200 font-semibold ${
                  linkCopied 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-500 hover:scale-105'
                }`}
              >
                {linkCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Anyone with this link can view the document
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Floating Action Button Component
function FloatingActionButton({ onClick, icon: Icon, label, color = "blue" }: {
  onClick: () => void
  icon: any
  label: string
  color?: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-8 right-8 p-4 bg-gradient-to-br from-${color}-500 to-${color}-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 z-40 group`}
      title={label}
    >
      <Icon className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </motion.button>
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated')
  const [activeTab, setActiveTab] = useState<'my-docs' | 'shared' | 'recent'>('my-docs')
  
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOverlay, setSidebarOverlay] = useState(false)
  const [commentsVisible, setCommentsVisible] = useState(false)
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
        span.style.padding = '2px 6px'
        span.style.borderRadius = '8px'
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
      showStatus('success', '✨ Document created from template!')
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
      showStatus('success', '📄 Document duplicated!')
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
      showStatus('success', '💾 Document saved!')
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
        showStatus('success', '🚀 Document shared successfully!')
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
        return allFilteredDocs.slice(0, 10) // Last 10 documents
      default:
        return allFilteredDocs
    }
  }

  const sortedDocs = [...getDocumentsByTab()].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'created':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  // Responsive breakpoint detection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarOverlay(true)
    }
  }, [isMobile])

  if (isFullscreen && activeDoc) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-50 flex flex-col">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {activeDoc.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFormatToolbar(!showFormatToolbar)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                showFormatToolbar 
                  ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 shadow-md' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Palette className="w-5 h-5" />
              <span>Format</span>
            </button>

            <button
              onClick={() => setCommentsVisible(!commentsVisible)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 relative ${
                commentsVisible 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Comments</span>
              {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                  {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>Save</span>
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
            <div className="h-full p-8 overflow-hidden">
              <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="h-full overflow-y-auto p-8" onMouseUp={handleTextSelection}>
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
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden shadow-lg"
            >
              <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    Comments
                  </h3>
                  <button
                    onClick={() => setCommentsVisible(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {comments.filter(c => c.documentId === activeDoc.id).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl mb-4 inline-block">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                      No comments yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Select text to add comments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.filter(c => c.documentId === activeDoc.id).map((comment) => (
                      <motion.div 
                        key={comment.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border transition-all duration-200 ${
                          comment.isRead 
                            ? 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-600 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {comment.author}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            {!comment.isRead && (
                              <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full font-semibold">
                                New
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {comment.selectedText && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              &ldquo;{comment.selectedText}&rdquo;
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200/50 dark:border-slate-700/50">
                {showCommentForm && selectedText && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-l-4 border-blue-500">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Selected text:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">&ldquo;{selectedText}&rdquo;</p>
                  </div>
                )}
                
                <textarea
                  placeholder={selectedText ? "Add a comment about the selected text..." : "Add a general comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-3">
                  {showCommentForm && (
                    <button 
                      onClick={cancelComment}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-auto shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOverlay && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOverlay(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${
        sidebarCollapsed ? 'w-20' : 'w-96'
      } ${
        isMobile ? (sidebarOverlay ? 'fixed z-50 translate-x-0' : 'fixed z-50 -translate-x-full') : 'relative'
      } bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 flex flex-col transition-all duration-300 shadow-xl`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Collab Zone</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Collaborative writing</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {!sidebarCollapsed && (
                <div className="flex gap-2">
                  <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-2xl hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40 transition-all duration-200 hover:scale-105"
                    title="Templates"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  if (isMobile) {
                    setSidebarOverlay(!sidebarOverlay)
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed)
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105"
              >
                {sidebarCollapsed || sidebarOverlay ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-slate-700 rounded-2xl p-1">
                {[
                  { id: 'my-docs', label: 'My Docs', icon: FileText },
                  { id: 'shared', label: 'Shared', icon: Users },
                  { id: 'recent', label: 'Recent', icon: Clock }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="updated">Last updated</option>
                  <option value="created">Date created</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Documents List */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))}
              </div>
            ) : sortedDocs.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl mb-4 inline-block">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {searchTerm ? 'No documents found' : 'No documents yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first document to get started'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleNew}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                    Create Document
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
                {sortedDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group cursor-pointer rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-lg ${
                      activeDoc?.id === doc.id
                        ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-600 shadow-md'
                        : 'border-gray-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-700'
                    } ${viewMode === 'grid' ? 'p-5' : 'p-4'} backdrop-blur-sm hover:scale-[1.02]`}
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
                            className="w-full px-3 py-2 text-sm border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700"
                            autoFocus
                          />
                        ) : (
                          <div className="relative">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1 pr-6">
                              {doc.title}
                            </h3>
                            {getUnreadCount(doc.id) > 0 && (
                              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                                {getUnreadCount(doc.id)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                          </span>
                          {doc.isShared && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              <Users className="w-3 h-3" />
                              Shared
                            </span>
                          )}
                        </div>
                        {viewMode === 'grid' && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {doc.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                          </p>
                        )}
                      </div>
                      
                      {!doc.isShared && (
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicate(doc)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTitleEditId(doc.id)
                              setNewTitle(doc.title)
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                            title="Rename"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(doc.id)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Collapsed Sidebar */}
        {sidebarCollapsed && (
          <div className="p-4 space-y-4">
            <button
              onClick={handleNew}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
              title="New Document"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-2xl hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40 transition-all duration-200 hover:scale-105 flex items-center justify-center"
              title="Templates"
            >
              <Zap className="w-6 h-6" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setSidebarOverlay(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105 md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {activeDoc && (
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {activeDoc.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last updated {formatDistanceToNow(new Date(activeDoc.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>

            {activeDoc && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFormatToolbar(!showFormatToolbar)}
                  className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    showFormatToolbar 
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 shadow-md' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Format</span>
                </button>

                <button
                  onClick={() => setCommentsVisible(!commentsVisible)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 relative ${
                    commentsVisible 
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Comments</span>
                  {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {comments.filter(c => c.documentId === activeDoc.id && !c.isRead).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Fullscreen</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Share</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
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
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`mx-6 mt-4 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                statusMsg.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <div className="p-2 bg-green-500 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="p-2 bg-red-500 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-medium">{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className={`${commentsVisible ? 'flex-1' : 'w-full'} transition-all duration-300`}>
            {activeDoc ? (
              <div className="h-full p-6 overflow-hidden">
                <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="h-full overflow-y-auto p-8" onMouseUp={handleTextSelection}>
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
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center max-w-md">
                  <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl mb-6 inline-block">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No document selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Select a document from the sidebar or create a new one to start collaborating.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleNew}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      Create New Document
                    </button>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-2xl hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40 transition-all duration-200 hover:scale-105 border border-purple-200 dark:border-purple-800"
                    >
                      <Zap className="w-5 h-5" />
                      From Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Panel */}
          {commentsVisible && activeDoc && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden shadow-lg"
            >
              <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    Comments
                  </h3>
                  <button
                    onClick={() => setCommentsVisible(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {comments.filter(c => c.documentId === activeDoc.id).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl mb-4 inline-block">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                      No comments yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Select text in the document to add comments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.filter(c => c.documentId === activeDoc.id).map((comment) => (
                      <motion.div 
                        key={comment.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border transition-all duration-200 ${
                          comment.isRead 
                            ? 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-600 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {comment.author}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            {!comment.isRead && (
                              <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full font-semibold">
                                New
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {comment.selectedText && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              &ldquo;{comment.selectedText}&rdquo;
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200/50 dark:border-slate-700/50">
                {showCommentForm && selectedText && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-l-4 border-blue-500">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Selected text:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">&ldquo;{selectedText}&rdquo;</p>
                  </div>
                )}
                
                <textarea
                  placeholder={selectedText ? "Add a comment about the selected text..." : "Add a general comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-3">
                  {showCommentForm && (
                    <button 
                      onClick={cancelComment}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-auto shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                    {selectedText ? 'Add Comment' : 'Comment'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      {isMobile && !activeDoc && (
        <FloatingActionButton
          onClick={handleNew}
          icon={Plus}
          label="Create Document"
          color="blue"
        />
      )}

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