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
}

const PROMPT_LIMITS: Record<string, number> = {
  free: 20,
  personal: 400,
  business: 2000,
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

  const promptLimit = PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || 'free'] || 0
  const promptsUsed = user?.promptsUsed ?? 0
  const promptsRemaining = promptLimit - promptsUsed
  const usagePercentage = (promptsUsed / promptLimit) * 100

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
    setSelectedFile(null)
    localStorage.removeItem('growfly_last_thread_id')
  }

  // Fetch user data from database on mount
  useEffect(() => {
    if (!token) {
      router.push('/onboarding')
      return
    }
    
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const userData = await response.json()
          console.log('✅ Fetched fresh user data from database:', userData)
          setUser(userData)
        } else {
          console.error('❌ Failed to fetch user data:', response.status)
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error)
      }
    }
    
    // Always fetch fresh data from database
    fetchUserData()
  }, [token, router, setUser])

  // Load existing thread if available
  useEffect(() => {
    if (!token) return
    
    const storedThreadId = localStorage.getItem('growfly_last_thread_id')
    const id = paramThreadId || storedThreadId

    if (id && id !== 'undefined') {
      setThreadId(id)
      
      fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json()
            setMessages(data.messages || [])
            setThreadTitle(data.title || formatTitleFromDate(new Date()))
          }
        })
        .catch((err) => {
          console.error('Failed to load chat history:', err)
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
    
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 200
    
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

    console.log('🚀 Starting stream for prompt:', prompt)

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
          console.log('✅ Stream completed. Full content:', fullContent)
          setIsLoading(false)
          setIsStreaming(false)
          
          // Get follow-ups if not provided
          if (!followUps.length && fullContent.trim()) {
            console.log('🔍 Fetching follow-ups...')
            followUps = await fetchFollowUps(fullContent)
            console.log('📋 Follow-ups received:', followUps)
          }
          
          // Update final message with follow-ups
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId ? { ...msg, content: fullContent, followUps } : msg
            )
          )
          
          // Update user data in database
          if (user) {
            const newPromptsUsed = (user.promptsUsed ?? 0) + 1
            const newXP = (user.totalXP ?? 0) + 2.5
            
            console.log('💾 Updating user data:', { promptsUsed: newPromptsUsed, totalXP: newXP })
            
            // Update local state
            setUser({
              ...user,
              promptsUsed: newPromptsUsed,
              totalXP: newXP,
            })
            
            // Sync to database
            fetch(`${API_BASE_URL}/api/user/update`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                promptsUsed: newPromptsUsed,
                totalXP: newXP,
              }),
            }).then(res => {
              if (res.ok) {
                console.log('✅ User data synced to database')
              } else {
                console.error('❌ Failed to sync user data')
              }
            }).catch(error => console.error('❌ Database sync error:', error))
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
    if (!text && !selectedFile) return

    setError(null)

    if (promptsUsed >= promptLimit) {
      setError(`You've reached your daily limit of ${promptLimit} prompts. Upgrade your plan to continue.`)
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
    const userMessage = { id: uId, role: 'user' as const, content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    
    // Ensure user message is visible above input area
    setTimeout(() => {
      const container = containerRef.current
      if (container) {
        // Scroll to show the user message but keep some margin from input
        container.scrollTop = container.scrollHeight - container.clientHeight + 20
      }
    }, 100)
    
    const aId = `a${Date.now()}`
    setMessages((prev) => [...prev, { id: aId, role: 'assistant', content: '' }])

    if (selectedFile) {
      // Handle file upload
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        try {
          setIsLoading(true)
          const res = await fetch(`${API_BASE_URL}/api/ai/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageBase64: base64, message: text }),
          })
          
          const data = await res.json()
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId
                ? { ...msg, content: data.content, imageUrl: base64 }
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
      }
      reader.readAsDataURL(selectedFile)
      setSelectedFile(null)
    } else {
      handleStream(text, aId)
    }
  }

  const getPromptLimitColor = () => {
    if (usagePercentage >= 90) return 'from-red-500 to-red-600'
    if (usagePercentage >= 70) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-purple-600'
  }

  const dismissError = () => setError(null)

  return (
    <div className="flex flex-col h-full p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-textPrimary dark:text-white transition-colors duration-300">
      {/* Header with Prompts Used and New Chat */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          {/* Enhanced Prompt Tracker */}
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

      {/* Chat Messages with much more padding to prevent overlap */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-6 pb-64">
        {messages.map((msg) => (
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

                  {/* Action Buttons */}
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
                      onClick={() => setShowSaveModal(true)}
                    />
                    <FaShareSquare
                      className="cursor-pointer hover:text-blue-500 transition-colors duration-200 transform hover:scale-110"
                      onClick={() => router.push('/collab-zone')}
                    />
                    {msg.imageUrl && (
                      <FaFileDownload className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 transform hover:scale-110" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Fixed Input Section at Bottom - Just the input box */}
      <div className="fixed bottom-0 left-44 right-0 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 border border-gray-200 dark:border-slate-700 backdrop-blur-md">
            <textarea
              ref={textareaRef}
              rows={4}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-textPrimary dark:text-white resize-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[6rem] max-h-40"
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
                  className={`cursor-pointer border-2 px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    isLoading || isStreaming || promptsUsed >= promptLimit
                      ? 'border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                      : 'border-blue-500 text-white bg-blue-500 hover:bg-blue-600 hover:border-blue-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                >
                  📎 <span className="text-sm font-medium">Upload Image / PDF</span>
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    📄 {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {input.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {input.length} characters
                  </span>
                )}
                <button
                  onClick={() => handleSubmit()}
                  disabled={(!input.trim() && !selectedFile) || isLoading || isStreaming || promptsUsed >= promptLimit}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none"
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
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setSelectedFile(file)
              }}
              className="hidden"
              ref={fileInputRef}
              disabled={isLoading || isStreaming || promptsUsed >= promptLimit}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SaveModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={async (title: string) => {
          await fetch(`${API_BASE_URL}/api/ai/saveResponse`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
          })
          setShowSaveModal(false)
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