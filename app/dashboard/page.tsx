'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { HiThumbUp, HiThumbDown, HiX } from 'react-icons/hi'
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

// Suggested prompts for empty state - UK English with business context
const SUGGESTED_PROMPTS = [
  {
    icon: <FaChartLine className="text-green-500" />,
    title: "Marketing Ideas",
    prompt: "What are some effective marketing strategies for my business? Please consider my brand settings and target market.",
    description: "Discover new ways to reach customers and grow your brand"
  },
  {
    icon: <FaBrain className="text-blue-500" />,
    title: "Business & Process Improvement",
    prompt: "Help me identify areas for business improvement and process optimisation in my company.",
    description: "Streamline operations and boost efficiency"
  },
  {
    icon: <FaUsers className="text-purple-500" />,
    title: "Document Creation & Editing",
    prompt: "I need help creating or editing business documents. What type of document would you like assistance with?",
    description: "Professional documents, proposals, and content"
  },
  {
    icon: <FaRocket className="text-orange-500" />,
    title: "Anything Else",
    prompt: "I need help with something specific to my industry. My business operates in [describe your sector/industry].",
    description: "HR, finance, legal, product development, research, and more"
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
  const [error, setError] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

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

  const createNewThread = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/create`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Thread creation failed:', text)
        throw new Error('Thread creation failed')
      }

      const data = await res.json()
      const newId = data.threadId
      setThreadId(newId)
      setMessages([])
      const title = formatTitleFromDate(new Date())
      setThreadTitle(title)
      localStorage.setItem('growfly_last_thread_id', newId)
    } catch (err) {
      console.error('Failed to create new thread:', err)
      setError('Failed to create new chat thread. Please refresh the page.')
    }
  }

  useEffect(() => {
    if (!token) {
      router.push('/onboarding')
      return
    }
    
    // Fetch user data from backend to ensure it's current
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const userData = await response.json()
          console.log('Fetched user data from backend:', userData)
          setUser(userData)
        } else {
          console.error('Failed to fetch user data:', response.status)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    // Only fetch if we don't have user data or it seems outdated
    if (!user || user.promptsUsed === undefined) {
      fetchUserData()
    }
  }, [token, router, user, setUser])

  // Debug user data
  useEffect(() => {
    console.log('User data:', user)
    console.log('Prompts used:', promptsUsed)
    console.log('XP:', user?.totalXP)
  }, [user, promptsUsed])

  useEffect(() => {
    const storedThreadId = localStorage.getItem('growfly_last_thread_id')
    const id = paramThreadId || storedThreadId

    if (!id) {
      createNewThread()
      return
    }

    setThreadId(id)

    if (!token || !id) return

    fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          setMessages(data.messages || [])
          setThreadTitle(data.title || formatTitleFromDate(new Date()))
        } catch (err) {
          console.error('Failed to parse chat history JSON:', { error: err, text })
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err)
      })
  }, [paramThreadId, token, createNewThread])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Improved auto-scroll that doesn't interfere with manual scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setIsUserScrolling(true)
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Set timeout to detect when user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false)
      }, 150)
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
    
    // Only auto-scroll if user isn't manually scrolling and is near the bottom
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
    
    if (!isUserScrolling && (isNearBottom || isLoading)) {
      // Use requestAnimationFrame for smoother scrolling during streaming
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ 
          behavior: isLoading ? 'auto' : 'smooth',
          block: 'end'
        })
      })
    }
  }, [messages, isUserScrolling, isLoading])

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
        : ['Can you explain that further?', 'How can I apply this?']
    } catch {
      return ["What's next?", 'Any examples to help?']
    }
  }

  const postMessage = async (
    role: 'user' | 'assistant',
    content: string
  ) => {
    // FIXED: Only try to post message if we have a valid threadId
    if (!threadId || threadId === 'undefined') {
      console.warn('Skipping postMessage - no valid threadId:', threadId)
      return
    }
    
    try {
      await fetch(`${API_BASE_URL}/api/chat/history/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, content }),
      })
    } catch (err) {
      console.error('Failed to POST message to history:', err)
      // Don't show error to user for history saving failures
    }
  }

  const handleStream = async (prompt: string, aId: string) => {
    let fullContent = ''
    let followUps: string[] = []
    setIsLoading(true)
    setError(null)

    await streamChat({
      prompt,
      threadId: threadId || undefined,
      token,
      onStream: (chunk) => {
        if (!chunk.content) return
        fullContent += chunk.content
        if (chunk.followUps) followUps = chunk.followUps

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aId
              ? {
                  ...msg,
                  content: fullContent,
                  followUps:
                    chunk.followUps ?? msg.followUps ?? ([] as string[]),
                }
              : msg
          )
        )
      },
      onComplete: async () => {
        setIsLoading(false)
        
        if (!followUps.length) {
          followUps = await fetchFollowUps(fullContent)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId ? { ...msg, followUps } : msg
            )
          )
        }
        
        // Only save to history if we have valid content and threadId
        if (fullContent.trim() && threadId && threadId !== 'undefined') {
          postMessage('assistant', fullContent)
        }
        
        if (!user) return
        
        // Update user data both locally and on backend
        const updatedUser = {
          ...user,
          promptsUsed: (user.promptsUsed ?? 0) + 1,
          totalXP: (user.totalXP ?? 0) + 2.5,
        }
        
        setUser(updatedUser)
        
        // Sync with backend to ensure persistence
        try {
          await fetch(`${API_BASE_URL}/api/user/update`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              promptsUsed: updatedUser.promptsUsed,
              totalXP: updatedUser.totalXP,
            }),
          })
          console.log('User data synced to backend')
        } catch (error) {
          console.error('Failed to sync user data to backend:', error)
        }
      },
      onError: (error) => {
        setIsLoading(false)
        console.error('StreamChat error:', error)
        
        if (error.type === 'rate_limit') {
          setError(error.message)
          // Remove the failed assistant message
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
  }

  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && !selectedFile) return

    // Clear any previous errors
    setError(null)

    // Check rate limit before sending
    if (promptsUsed >= promptLimit) {
      setError(`You've reached your daily limit of ${promptLimit} prompts. Upgrade your plan to continue.`)
      return
    }

    const uId = `u${Date.now()}`
    setMessages((prev) => [...prev, { id: uId, role: 'user', content: text }])
    setInput('')
    
    // Only save user message to history if we have a valid threadId
    if (threadId && threadId !== 'undefined') {
      postMessage('user', text)
    }

    const aId = `a${Date.now()}`
    setMessages((prev) => [...prev, { id: aId, role: 'assistant', content: '' }])

    if (selectedFile) {
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
          
          if (res.status === 403) {
            const errorData = await res.json()
            if (errorData.error === 'Prompt limit reached.') {
              setError(`You've reached your daily limit of ${errorData.promptLimit} prompts. Upgrade your plan to continue.`)
              setMessages((prev) => prev.filter(msg => msg.id !== aId))
              setIsLoading(false)
              return
            }
          }
          
          const data = await res.json()
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aId
                ? { ...msg, content: data.content, imageUrl: base64 }
                : msg
            )
          )
          
          if (threadId && threadId !== 'undefined') {
            postMessage('assistant', data.content)
          }
          
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
      {/* Header - Only show when there are messages */}
      {messages.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1" /> {/* Empty space to center the tracker */}
          <div className="flex items-center gap-4">
            {/* Enhanced Prompt Tracker */}
            <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prompts Used
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-24 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getPromptLimitColor()} rounded-full transition-all duration-300 ease-out`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-white min-w-[3rem]">
                    {promptsUsed}/{promptLimit}
                  </span>
                </div>
                {promptsRemaining <= 5 && promptsRemaining > 0 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    {promptsRemaining} left
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={createNewThread}
              className="text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
            >
              <FaSyncAlt className="text-xs" /> New Chat
            </button>
          </div>
        </div>
      )}

      {/* Error Message with Dismiss */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm relative">
          <button 
            onClick={dismissError}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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

      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-6 pb-6">
        {/* Enhanced Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="text-center space-y-4 max-w-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBrain className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Welcome to Growfly AI
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Your AI-powered business assistant is here to help with strategy, marketing, process improvement, document creation, and insights across all business sectors. 
                Choose a category below or ask anything about your business.
              </p>
            </div>

            {/* Suggested Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              {SUGGESTED_PROMPTS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(suggestion.prompt)}
                  disabled={isLoading || promptsUsed >= promptLimit}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 text-left hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white text-lg mb-2">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Start Button */}
            <button
              onClick={() => handleSubmit('What can Growfly do for me? Please consider my brand settings and business context.')}
              disabled={isLoading || promptsUsed >= promptLimit}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none"
            >
              ✨ Explore Growfly&apos;s Capabilities
            </button>
          </div>
        )}

        {/* Messages */}
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
                {msg.content || (msg.role === 'assistant' && isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-pulse">Thinking</div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </span>
                ) : '')}
              </p>

              {msg.role === 'assistant' && (
                <>
                  {/* Follow-up Questions */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex gap-3 mt-5 flex-wrap">
                      {msg.followUps.map((fu, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(fu)}
                          disabled={isLoading || promptsUsed >= promptLimit}
                          className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-800/40 dark:hover:to-blue-800/40 disabled:from-gray-100 disabled:to-gray-100 dark:disabled:from-gray-800 dark:disabled:to-gray-800 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 disabled:text-gray-500 dark:disabled:text-gray-500 px-4 py-2 rounded-xl text-xs font-medium shadow-sm border border-indigo-200 dark:border-indigo-700 disabled:border-gray-200 dark:disabled:border-gray-600 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
                        >
                          💡 {fu}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons - Always show for assistant messages */}
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

      {/* Enhanced Input Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-5 mt-4">
        <textarea
          ref={textareaRef}
          rows={1}
          className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-textPrimary dark:text-white resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[2.5rem] max-h-32"
          placeholder="Ask Growfly anything about your business..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          disabled={isLoading || promptsUsed >= promptLimit}
        />
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <div
              onClick={() => !isLoading && promptsUsed < promptLimit && fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                isLoading || promptsUsed >= promptLimit
                  ? 'border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                  : 'border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
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
              disabled={(!input.trim() && !selectedFile) || isLoading || promptsUsed >= promptLimit}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                '➤ Send'
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
          disabled={isLoading || promptsUsed >= promptLimit}
        />
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