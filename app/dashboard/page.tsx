'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi'
import {
  FaRegBookmark,
  FaShareSquare,
  FaFileDownload,
  FaSyncAlt,
  FaRocket,
  FaChartLine,
  FaBrain,
  FaUsers,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaTimes,
  FaPaperclip
} from 'react-icons/fa'
import SaveModal from '@/components/SaveModal'
import FeedbackModal from '@/components/FeedbackModal'
import streamChat from '@lib/streamChat'
import { useUserStore } from '@lib/store'

// Use environment variable directly instead of importing from constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  followUps?: string[]
  files?: UploadedFile[]
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
  preview?: string
  content?: string
}

const PROMPT_LIMITS: Record<string, number> = {
  free: 20,
  personal: 400,
  business: 2000,
}

// File Preview Component
const FilePreview: React.FC<{ file: UploadedFile; onRemove: () => void }> = ({ file, onRemove }) => {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return file.preview ? (
        <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded border-2 border-gray-200" />
      ) : (
        <FaFileImage className="w-12 h-12 text-blue-500" />
      )
    } else if (file.type === 'application/pdf') {
      return <FaFilePdf className="w-12 h-12 text-red-500" />
    } else {
      return <FaFileAlt className="w-12 h-12 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="relative bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <FaTimes className="w-3 h-3" />
      </button>
      <div className="flex items-center gap-3">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{file.type}</p>
        </div>
      </div>
    </div>
  )
}

// Quick categories for collapsible bar
const QUICK_CATEGORIES = [
  {
    icon: <FaChartLine className="text-emerald-500" />,
    title: "Marketing Ideas",
    description: "Boost your brand and reach new customers",
    prompt: "What are some effective marketing strategies for my business? Please consider my brand settings and target market.",
  },
  {
    icon: <FaBrain className="text-blue-500" />,
    title: "Business & Process Improvement",
    description: "Streamline operations and increase efficiency",
    prompt: "Help me identify areas for business improvement and process optimisation in my company.",
  },
  {
    icon: <FaUsers className="text-purple-500" />,
    title: "Document Creation & Editing",
    description: "Professional documents and content creation",
    prompt: "I need help creating or editing business documents. What type of document would you like assistance with?",
  },
  {
    icon: <FaRocket className="text-amber-500" />,
    title: "How can Growfly improve my output today?",
    description: "Don't know where to start today? Ask Growfly for some ideas!",
    prompt: "I'm looking for ways to improve my productivity and output today. Can you give me some personalized suggestions based on my business needs?",
  }
]

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramThreadId = searchParams?.get('threadId')

  const { user, setUser } = useUserStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  // Calculate prompt limits and usage with better debugging
  const promptLimit = PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || 'free'] || 20
  const promptsUsed = user?.promptsUsed ?? 0
  const promptsRemaining = Math.max(0, promptLimit - promptsUsed)
  const usagePercentage = Math.min(100, (promptsUsed / promptLimit) * 100)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadTitle, setThreadTitle] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [showCategories, setShowCategories] = useState(true)
  const [currentSaveMessageId, setCurrentSaveMessageId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const formatTitleFromDate = (date: Date) => {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'long',
    })} Chat — ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const createNewThread = () => {
    setMessages([])
    setThreadId(null)
    setThreadTitle('')
    setError(null)
    setInput('')
    setUploadedFiles([])
    localStorage.removeItem('growfly_last_thread_id')
    
    // Also clear the URL parameter to prevent reload
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  // Enhanced user data fetching with better error handling and CORS fix
  useEffect(() => {
    if (!token) {
      router.push('/onboarding')
      return
    }
    
    const fetchUserData = async () => {
      try {
        // Use the same pattern as settings page that works
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {  // ← Add API_BASE_URL like settings
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          console.error('❌ Failed to fetch user data:', response.status, response.statusText)
          
          // If we get unauthorized, redirect to onboarding
          if (response.status === 401) {
            localStorage.removeItem('growfly_jwt')
            router.push('/onboarding')
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error)
        // Don't redirect on network errors, just log them
      }
    }
    
    // Fetch data on mount
    fetchUserData()
    
    // Set up periodic sync (less frequent to avoid spam)
    const syncInterval = setInterval(fetchUserData, 60000)
    
    return () => clearInterval(syncInterval)
  }, [token, router, setUser])

  // Load existing thread if available
  useEffect(() => {
    if (!token) return
    
    const storedThreadId = localStorage.getItem('growfly_last_thread_id')
    const id = paramThreadId || storedThreadId

    // Only load thread if there's a valid ID and it's not 'undefined'
    if (id && id !== 'undefined' && id !== 'null') {
      setThreadId(id)
      
      fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json()
            // Only set messages if we actually have messages from the thread
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages)
              setThreadTitle(data.title || formatTitleFromDate(new Date()))
            }
          } else {
            // If thread doesn't exist, clear the stored ID
            localStorage.removeItem('growfly_last_thread_id')
          }
        })
        .catch((err) => {
          console.error('Failed to load chat history:', err)
          localStorage.removeItem('growfly_last_thread_id')
        })
    }
  }, [paramThreadId, token])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Improved scroll handling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setIsUserScrolling(true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1000)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    // Auto-scroll to bottom when new messages arrive or when streaming
    if (!isUserScrolling && (isStreaming || messages.length > 0)) {
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ 
          behavior: isStreaming ? 'auto' : 'smooth',
          block: 'end'
        })
      })
    }
  }, [messages, isUserScrolling, isStreaming])

  // Enhanced file handling
  const handleFileSelect = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
      }

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, preview: e.target?.result as string } : f
          ))
        }
        reader.readAsDataURL(file)
      }

      // Extract text from PDFs (simplified)
      if (file.type === 'application/pdf') {
        newFile.content = `PDF file: ${file.name}`
      }

      setUploadedFiles(prev => [...prev, newFile])
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const fetchFollowUps = async (text: string): Promise<string[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Follow-ups fetch failed')
      const data = await res.json()
      const rawFollowUps = (data.followUps as string[]) || []
      const unique = Array.from(new Set(rawFollowUps)).slice(0, 2)
      return unique.length > 0
        ? unique
        : ['Can you explain that further?', 'What would you recommend next?']
    } catch {
      return ['Tell me more about this', 'How can I implement this?']
    }
  }

  const handleStream = async (prompt: string, aId: string) => {
    let fullContent = ''
    let followUps: string[] = []
    setIsLoading(true)
    setIsStreaming(true)
    setError(null)

    // Initialize empty message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === aId ? { ...msg, content: '' } : msg
      )
    )

    try {
      await streamChat({
        prompt,
        threadId: threadId || undefined,
        token,
        onStream: (chunk) => {
          console.log('📡 Stream chunk received:', chunk)
          
          if (chunk.content) {
            fullContent += chunk.content
            
            // Update message with streaming content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aId
                  ? { ...msg, content: fullContent }
                  : msg
              )
            )
          }
          
          if (chunk.followUps) {
            followUps = chunk.followUps
          }
        },
        onComplete: async () => {
          setIsLoading(false)
          setIsStreaming(false)
          
          // Get follow-ups if not provided
          if (!followUps.length && fullContent.trim()) {
            followUps = await fetchFollowUps(fullContent)
          }
          
          // Update final message with follow-ups
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId ? { ...msg, content: fullContent, followUps } : msg
            )
          )
          
          // Update user data and sync to database immediately
          if (user) {
            const newPromptsUsed = (user.promptsUsed ?? 0) + 1
            const newXP = (user.totalXP ?? 0) + 2.5
            
            // Update local state first
            setUser({
              ...user,
              promptsUsed: newPromptsUsed,
              totalXP: newXP,
            })
            
            // Sync to database and fetch fresh data to ensure consistency
            try {
              const updateResponse = await fetch(`${API_BASE_URL}/api/user/update`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  promptsUsed: newPromptsUsed,
                  totalXP: newXP,
                }),
              })
              
              if (updateResponse.ok) {
                // Fetch fresh user data to ensure sync
                const freshDataResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                
                if (freshDataResponse.ok) {
                  const freshUserData = await freshDataResponse.json()
                  setUser(freshUserData)
                }
              } else {
                console.error('❌ Failed to sync user data:', updateResponse.status)
              }
            } catch (error) {
              console.error('❌ Database sync error:', error)
            }
          }
        },
        onError: (error) => {
          console.error('❌ StreamChat error:', error)
          setIsLoading(false)
          setIsStreaming(false)
          
          if (error.type === 'rate_limit') {
            setError(error.message)
            setMessages((prev) => prev.filter(msg => msg.id !== aId))
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aId
                  ? { ...msg, content: '❌ Failed to get response. Please try again.' }
                  : msg
              )
            )
          }
        },
      })
    } catch (error) {
      console.error('❌ Stream setup error:', error)
      setIsLoading(false)
      setIsStreaming(false)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aId
            ? { ...msg, content: '❌ Failed to get response. Please try again.' }
            : msg
        )
      )
    }
  }

  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && uploadedFiles.length === 0) return

    setError(null)

    // Use the latest user data for prompt limit check
    if (promptsUsed >= promptLimit) {
      const planType = user?.subscriptionType?.toLowerCase() || 'free'
      const periodText = planType === 'free' ? 'daily' : 'monthly'
      setError(`You've reached your ${periodText} limit of ${promptLimit} prompts. Upgrade your plan to continue.`)
      return
    }

    // Create thread ID only when needed
    let currentThreadId = threadId
    if (!currentThreadId) {
      currentThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setThreadId(currentThreadId)
      localStorage.setItem('growfly_last_thread_id', currentThreadId)
    }

    const uId = `u${Date.now()}`
    const userMessage = { 
      id: uId, 
      role: 'user' as const, 
      content: text,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setUploadedFiles([]) // Clear uploaded files after sending
    
    const aId = `a${Date.now()}`
    setMessages((prev) => [...prev, { id: aId, role: 'assistant', content: '' }])

    // Handle file uploads (enhanced)
    if (uploadedFiles.length > 0) {
      // For now, include file info in the prompt and use existing image analysis for images
      const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'))
      const otherFiles = uploadedFiles.filter(f => !f.type.startsWith('image/'))
      
      if (imageFiles.length > 0 && imageFiles[0].preview) {
        // Use existing image analysis for the first image
        try {
          setIsLoading(true)
          const res = await fetch(`${API_BASE_URL}/api/ai/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageBase64: imageFiles[0].preview, message: text }),
          })
          
          const data = await res.json()
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId
                ? { ...msg, content: data.content, imageUrl: imageFiles[0].preview }
                : msg
            )
          )
          
          setIsLoading(false)
        } catch (err) {
          console.error('Image analysis failed:', err)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId
                ? { ...msg, content: '❌ Failed to analyze image.' }
                : msg
            )
          )
          setIsLoading(false)
        }
      } else {
        // Handle other files with enhanced prompt
        const fileInfo = uploadedFiles.map(f => `[File: ${f.name} (${f.type})]`).join('\n')
        const enhancedPrompt = `${text}\n\nAttached files:\n${fileInfo}`
        handleStream(enhancedPrompt, aId)
      }
    } else {
      handleStream(text, aId)
    }
  }

  // ✅ FIXED: Save to Saved Responses (personal saves)
  const handleSaveResponse = async (title: string, messageId: string) => {
    try {
      // Get the specific message content
      const message = messages.find(m => m.id === messageId)
      if (!message || message.role !== 'assistant') {
        throw new Error('Invalid message to save')
      }

      const response = await fetch(`${API_BASE_URL}/api/saved`, {  // ✅ FIXED: Personal saved responses
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          content: message.content
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save response')
      }

      const result = await response.json()
      setShowSaveModal(false)
      setError(null)
      
      return result
    } catch (error) {
      console.error('Error saving response:', error)
      setError('Failed to save response. Please try again.')
      return null
    }
  }

  // ✅ FIXED: Save to Collab Zone (for sharing/collaboration)
  const handleSaveToCollabZone = async (title: string, messageId: string) => {
    try {
      // Get the specific message content
      const message = messages.find(m => m.id === messageId)
      if (!message || message.role !== 'assistant') {
        throw new Error('Invalid message to save')
      }

      const response = await fetch(`${API_BASE_URL}/api/collab`, {  // ✅ Collab Zone for sharing
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          content: message.content,
          type: 'document'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save to Collab Zone')
      }

      const result = await response.json()
      setError(null)
      
      return result
    } catch (error) {
      console.error('Error saving to Collab Zone:', error)
      setError('Failed to save to Collab Zone. Please try again.')
      return null
    }
  }

  // ✅ FIXED: Share to Collab Zone (save then redirect)
  const handleShareToCollabZone = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    try {
      // First save to Collab Zone with auto-generated title
      const autoTitle = `Shared Response - ${new Date().toLocaleDateString()}`
      const result = await handleSaveToCollabZone(autoTitle, messageId)
      
      if (result) {
        // Then redirect to Collab Zone with the document ID
        router.push(`/collab-zone?document=${result.id}`)
      }
    } catch (error) {
      console.error('Error sharing to Collab Zone:', error)
      setError('Failed to share to Collab Zone. Please try again.')
    }
  }

  const getPromptLimitColor = () => {
    if (usagePercentage >= 90) return 'from-red-500 to-red-600'
    if (usagePercentage >= 70) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-purple-600'
  }

  const dismissError = () => setError(null)

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-textPrimary dark:text-white transition-colors duration-300">
      
      {/* Main Content Area with proper padding */}
      <div className="flex-1 overflow-hidden p-6">
        
        {/* Header with Prompts Used and New Chat */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {/* Enhanced Prompt Tracker with better debugging */}
            <div className="bg-white dark:bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Prompts Used
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getPromptLimitColor()} rounded-full transition-all duration-300 ease-out`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 min-w-[3rem]">
                    {promptsUsed}/{promptLimit}
                  </span>
                </div>
                {promptsRemaining <= 5 && promptsRemaining > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    {promptsRemaining} left
                  </span>
                )}
                {promptsUsed >= promptLimit && (
                  <span className="text-xs text-red-600 font-medium">
                    Limit reached
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={createNewThread}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
            >
              <FaSyncAlt className="text-xs" /> New Chat
            </button>
          </div>
        </div>

        {/* Enhanced Collapsible Categories Bar */}
        <div className="mb-6">
          <div className="text-center mb-3">
            <h3 className="text-xl font-bold text-blue-500 mb-1">
              Quick Start
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find out how we can help you today
            </p>
          </div>
          
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-white hover:text-white transition-all duration-200 mb-4 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 border border-blue-400 hover:border-blue-500 backdrop-blur-sm shadow-lg hover:shadow-xl"
          >
            {showCategories ? (
              <>
                <HiChevronUp className="w-4 h-4" />
                <span>Hide Quick Start</span>
              </>
            ) : (
              <>
                <HiChevronDown className="w-4 h-4" />
                <span>Show Quick Start</span>
              </>
            )}
          </button>
          
          {showCategories && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 rounded-2xl border border-blue-200/40 dark:border-slate-600/40 backdrop-blur-sm shadow-lg">
              {QUICK_CATEGORIES.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(category.prompt)}
                  disabled={isLoading || isStreaming || promptsUsed >= promptLimit}
                  className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-gray-200/70 dark:border-slate-700/70 hover:border-blue-300/70 dark:hover:border-blue-500/70 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm hover:bg-blue-50/30 dark:hover:bg-slate-700/95"
                >
                  <div className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-xs leading-tight">
                      {category.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm relative">
            <button 
              onClick={dismissError}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <HiX className="w-4 h-4" />
            </button>
            <strong>⚠️ {error}</strong>
            {error.includes('limit') && (
              <div className="mt-2">
                <button
                  onClick={() => router.push('/change-plan')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  Upgrade Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat Messages - now with proper spacing for fixed input */}
        <div ref={containerRef} className="flex-1 overflow-y-auto space-y-6 pb-8">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Welcome to Growfly!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ready to get started? Click one of the Quick Start buttons above or type your question in the box below to begin your first conversation.
                </p>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  ✨ Choose a Quick Start option or ask anything you&apos;d like!
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div
                className={`max-w-4xl p-5 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl relative ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                    : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm'
                }`}
              >
                {/* ✅ ENHANCED: Display uploaded files for user messages */}
                {msg.role === 'user' && msg.files && msg.files.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs text-blue-100 font-medium">📎 Attached Files:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.files.map((file) => (
                        <div key={file.id} className="bg-blue-500/20 rounded-lg p-2 flex items-center gap-2">
                          {file.type.startsWith('image/') && file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
                          ) : file.type === 'application/pdf' ? (
                            <FaFilePdf className="w-6 h-6 text-red-300" />
                          ) : (
                            <FaFileAlt className="w-6 h-6 text-gray-300" />
                          )}
                          <span className="text-xs text-blue-100">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.imageUrl && (
                  <Image
                    src={msg.imageUrl}
                    alt="Uploaded"
                    width={280}
                    height={280}
                    className="mb-4 rounded-xl shadow-md"
                  />
                )}
                
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content ? (
                    msg.content
                  ) : msg.role === 'assistant' && (isLoading || isStreaming) ? (
                    <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse">Working on your response...</span>
                    </span>
                  ) : ''}
                </p>

                {msg.role === 'assistant' && msg.content && (
                  <>
                    {/* Follow-up Questions */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="flex gap-3 mt-5 flex-wrap">
                        {msg.followUps.map((fu, i) => (
                          <button
                            key={i}
                            onClick={() => handleSubmit(fu)}
                            disabled={isLoading || isStreaming || promptsUsed >= promptLimit}
                            className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-800/40 dark:hover:to-blue-800/40 disabled:from-gray-100 disabled:to-gray-100 dark:disabled:from-gray-800 dark:disabled:to-gray-800 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 disabled:text-gray-500 dark:disabled:text-gray-500 px-4 py-2 rounded-xl text-xs font-medium shadow-sm border border-indigo-200 dark:border-indigo-700 disabled:border-gray-200 dark:disabled:border-gray-600 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
                          >
                            💡 {fu}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ✅ ENHANCED: Action Buttons with individual message saving */}
                    <div className="flex gap-4 mt-4 text-lg text-gray-500 dark:text-gray-400">
                      <HiThumbUp
                        className="cursor-pointer hover:text-green-500 transition-colors duration-200 transform hover:scale-110"
                        onClick={() => setShowFeedbackModal(true)}
                      />
                      <HiThumbDown
                        className="cursor-pointer hover:text-red-500 transition-colors duration-200 transform hover:scale-110"
                        onClick={() => setShowFeedbackModal(true)}
                      />
                      <FaRegBookmark
                        className="cursor-pointer hover:text-yellow-500 transition-colors duration-200 transform hover:scale-110"
                        onClick={() => {
                          setCurrentSaveMessageId(msg.id)
                          setShowSaveModal(true)
                        }}
                        title="Save to Saved Responses"
                      />
                      <FaShareSquare
                        className="cursor-pointer hover:text-blue-500 transition-colors duration-200 transform hover:scale-110"
                        onClick={() => handleShareToCollabZone(msg.id)}
                        title="Share to Collab Zone"
                      />
                      {msg.imageUrl && (
                        <FaFileDownload className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 transform hover:scale-110" />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ✅ ENHANCED: File Upload Preview */}
      {uploadedFiles.length > 0 && (
        <div className="px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  📎 Attached Files ({uploadedFiles.length})
                </h4>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadedFiles.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    onRemove={() => removeFile(file.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ENHANCED: Fixed Input Section with multiple file support */}
      <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-4 shadow-inner">
            <textarea
              ref={textareaRef}
              rows={3}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-textPrimary dark:text-white resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[4rem] max-h-32"
              placeholder="Type out your prompt here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              disabled={isLoading || isStreaming || promptsUsed >= promptLimit}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => !isLoading && !isStreaming && promptsUsed < promptLimit && fileInputRef.current?.click()}
                  className={`cursor-pointer border-2 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    isLoading || isStreaming || promptsUsed >= promptLimit
                      ? 'border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                      : 'border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-600 shadow-sm hover:shadow-md transform hover:scale-[1.02]'
                  }`}
                >
                  <FaPaperclip className="text-sm" />
                  <span className="text-sm font-medium">Upload Files</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {input.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {input.length} characters
                  </span>
                )}
                <button
                  onClick={() => handleSubmit()}
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading || isStreaming || promptsUsed >= promptLimit}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none"
                >
                  {isLoading || isStreaming ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <input
              type="file"
              accept="image/*,application/pdf,.txt,.doc,.docx"
              onChange={(e) => {
                const files = e.target.files
                if (files) handleFileSelect(files)
              }}
              className="hidden"
              ref={fileInputRef}
              disabled={isLoading || isStreaming || promptsUsed >= promptLimit}
              multiple
            />
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Modals with enhanced save functionality */}
      <SaveModal
        open={showSaveModal}
        onClose={() => {
          setShowSaveModal(false)
          setCurrentSaveMessageId(null)
        }}
        onConfirm={async (title: string) => {
          if (currentSaveMessageId) {
            await handleSaveResponse(title, currentSaveMessageId)  // ✅ FIXED: Save to personal saved responses
          }
        }}
      />

      <FeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        responseId={threadId || 'unknown'}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}