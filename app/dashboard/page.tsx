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
  FaRocket,
  FaChartLine,
  FaBrain,
  FaUsers,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaTimes,
  FaPaperclip,
  FaFileExcel,
  FaPalette,
  FaSpinner,
  FaMagic,
  FaCheck,
  FaImages,
  FaQuestionCircle,
  FaCopy,
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
  generatedImage?: GeneratedImage
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
  preview?: string
  content?: string
  file?: File
}

interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  revisedPrompt: string
  size: string
  style: string
  createdAt: string
}

interface ImageUsage {
  subscriptionType: string
  subscriptionName: string
  totalPrompts: {
    used: number
    limit: number
    remaining: number
  }
  dailyImages: {
    used: number
    limit: number
    remaining: number
  }
  monthlyImages: {
    used: number
    limit: number
    remaining: number
  }
  canGenerate: boolean
  blockedReason?: string
  _fallback?: boolean
}

const PROMPT_LIMITS: Record<string, number> = {
  free: 20,
  personal: 400,
  business: 2000,
}

const IMAGE_LIMITS: Record<string, { daily: number; monthly: number }> = {
  free: { daily: 2, monthly: 10 },
  personal: { daily: 10, monthly: 50 },
  business: { daily: 30, monthly: 150 },
}

const MAX_PERSISTENT_MESSAGES = 10

// Copy functionality
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Image error handling component
const SafeImage: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string;
  onError?: () => void;
}> = ({ src, alt, className, onError }) => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleError = () => {
    setError(true)
    setLoading(false)
    onError?.()
  }

  const handleLoad = () => {
    setLoading(false)
  }

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-xl border border-gray-200`}>
        <div className="text-center p-4">
          <FaImages className="text-gray-400 text-2xl mx-auto mb-2" />
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center rounded-xl animate-pulse`}>
          <FaSpinner className="text-gray-400 text-xl animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

// File Preview Component
const FilePreview: React.FC<{ file: UploadedFile; onRemove: () => void }> = ({ file, onRemove }) => {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return file.preview ? (
        <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded border border-gray-200" />
      ) : (
        <FaFileImage className="w-12 h-12 text-gray-500" />
      )
    } else if (file.type === 'application/pdf') {
      return <FaFilePdf className="w-12 h-12 text-red-500" />
    } else if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return <FaFileExcel className="w-12 h-12 text-green-500" />
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return <FaFileAlt className="w-12 h-12 text-gray-600" />
    } else if (file.type.includes('presentation') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
      return <FaFileAlt className="w-12 h-12 text-orange-500" />
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
    <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <FaTimes className="w-3 h-3" />
      </button>
      <div className="flex items-center gap-3">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          <p className="text-xs text-gray-400">{file.type}</p>
        </div>
      </div>
    </div>
  )
}

const ImageGenerationModal: React.FC<{
  open: boolean
  onClose: () => void
  onImageGenerated: (image: GeneratedImage) => void
}> = ({ open, onClose, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [style, setStyle] = useState('vivid')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState('')
  const [imageUsage, setImageUsage] = useState<ImageUsage | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''
  const router = useRouter()

  useEffect(() => {
    if (open && token) {
      fetch(`${API_BASE_URL}/api/dalle/usage`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .then(data => {
          if (data && !data.error && data.dailyImages && data.monthlyImages) {
            setImageUsage(data)
          } else {
            const subType = data.subscriptionType || 'free'
            const limits = IMAGE_LIMITS[subType] || IMAGE_LIMITS.free
            setImageUsage({
              subscriptionType: subType,
              subscriptionName: subType.charAt(0).toUpperCase() + subType.slice(1),
              dailyImages: { used: 0, limit: limits.daily, remaining: limits.daily },
              monthlyImages: { used: 0, limit: limits.monthly, remaining: limits.monthly },
              totalPrompts: { used: 0, limit: PROMPT_LIMITS[subType] || 20, remaining: PROMPT_LIMITS[subType] || 20 },
              canGenerate: true,
              _fallback: true
            })
          }
        })
        .catch(err => {
          console.error('❌ Failed to fetch image usage in modal:', err)
          const limits = IMAGE_LIMITS.free
          setImageUsage({
            subscriptionType: 'free',
            subscriptionName: 'Free',
            dailyImages: { used: 0, limit: limits.daily, remaining: limits.daily },
            monthlyImages: { used: 0, limit: limits.monthly, remaining: limits.monthly },
            totalPrompts: { used: 0, limit: PROMPT_LIMITS.free, remaining: PROMPT_LIMITS.free },
            canGenerate: true,
            _fallback: true
          })
        })
    }
  }, [open, token])

  useEffect(() => {
    if (open) {
      setShowSuccess(false)
      setGeneratedImage(null)
      setError('')
    }
  }, [open])

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 3) {
      setError('Prompt must be at least 3 characters long')
      return
    }

    setIsGenerating(true)
    setError('')
    setShowSuccess(false)

    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          prompt, 
          size, 
          quality: 'standard',
          style 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          if (data.reason === 'daily_images') {
            setError(`Daily image limit reached (${data.current}/${data.limit}). ${data.resetInfo || 'Resets at midnight.'} Upgrade for more images!`)
          } else if (data.reason === 'monthly_images') {
            setError(`Monthly image limit reached (${data.current}/${data.limit}). ${data.resetInfo || 'Resets monthly.'} Upgrade for more images!`)
          } else if (data.reason === 'total_prompts') {
            setError(`Total prompt limit reached (${data.current}/${data.limit}). ${data.resetInfo || 'Resets monthly.'} Upgrade for more prompts!`)
          } else {
            setError(data.message || 'Generation limit reached. Please upgrade your plan!')
          }
        } else {
          throw new Error(data.error || 'Failed to generate image')
        }
        return
      }

      const imageData: GeneratedImage = {
        id: data.imageId,
        url: data.imageUrl,
        originalPrompt: data.prompt,
        revisedPrompt: data.prompt,
        size: size,
        style: style,
        createdAt: new Date().toISOString()
      }

      setGeneratedImage(imageData)
      setShowSuccess(true)

      setTimeout(() => {
        onImageGenerated(imageData)
        setPrompt('')
        onClose()
      }, 2000)

      if (data.usage) {
        setImageUsage(prev => prev ? {
          ...prev,
          totalPrompts: data.usage.totalPrompts,
          dailyImages: data.usage.dailyImages,
          monthlyImages: data.usage.monthlyImages,
          canGenerate: data.usage.dailyImages.remaining > 0 && data.usage.monthlyImages.remaining > 0 && data.usage.totalPrompts.remaining > 0
        } : null)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpgrade = () => {
    onClose()
    router.push('/change-plan')
  }

  if (!open) return null

  const canGenerate = imageUsage?.canGenerate ?? false
  const isAtDailyLimit = imageUsage && (imageUsage.dailyImages?.remaining || 0) <= 0
  const isAtMonthlyLimit = imageUsage && (imageUsage.monthlyImages?.remaining || 0) <= 0
  const isAtPromptLimit = imageUsage && (imageUsage.totalPrompts?.remaining || 0) <= 0

  const getResetInfo = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    const hoursUntilMidnight = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60))
    const daysUntilNextMonth = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return { hoursUntilMidnight, daysUntilNextMonth }
  }

  const resetInfo = getResetInfo()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaPalette className="text-gray-700" />
              Create an image with Growfly
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isGenerating}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {showSuccess && generatedImage ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Image Created Successfully!
                </h3>
                <p className="text-gray-600">
                  Your image has been generated and saved to your gallery.
                </p>
              </div>
              
              <div className="mb-6">
                <SafeImage
                  src={generatedImage.url}
                  alt={generatedImage.originalPrompt}
                  className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                Adding to your chat conversation...
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-800">
                  <strong>🎨 Create professional images for your business</strong><br />
                  Describe what you want and our AI will generate a custom image. Perfect for social media, presentations, marketing materials, and more.
                </p>
              </div>

              {imageUsage && (
                <div className="mb-6 space-y-4">
                  {imageUsage._fallback && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-yellow-800 text-sm">
                        ⚠️ Using default limits. Some features may be limited until your account data is refreshed.
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">
                        {imageUsage.subscriptionName} Plan Limits
                      </h3>
                      {!canGenerate && (
                        <button
                          onClick={handleUpgrade}
                          className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-600 text-xs">Daily Images</div>
                        <div className={`font-bold text-lg ${isAtDailyLimit ? 'text-red-600' : 'text-gray-700'}`}>
                          {imageUsage.dailyImages?.remaining || 0}/{imageUsage.dailyImages?.limit === -1 ? '∞' : imageUsage.dailyImages?.limit || 0}
                        </div>
                        {isAtDailyLimit && (
                          <div className="text-xs text-red-500 mt-1">
                            Resets in {resetInfo.hoursUntilMidnight}h
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-600 text-xs">Monthly Images</div>
                        <div className={`font-bold text-lg ${isAtMonthlyLimit ? 'text-red-600' : 'text-gray-700'}`}>
                          {imageUsage.monthlyImages?.remaining || 0}/{imageUsage.monthlyImages?.limit === -1 ? '∞' : imageUsage.monthlyImages?.limit || 0}
                        </div>
                        {isAtMonthlyLimit && (
                          <div className="text-xs text-red-500 mt-1">
                            Resets in {resetInfo.daysUntilNextMonth}d
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-600 text-xs">Total Prompts</div>
                        <div className={`font-bold text-lg ${isAtPromptLimit ? 'text-red-600' : 'text-gray-700'}`}>
                          {imageUsage.totalPrompts?.remaining || 0}/{imageUsage.totalPrompts?.limit === -1 ? '∞' : imageUsage.totalPrompts?.limit || 0}
                        </div>
                        {isAtPromptLimit && (
                          <div className="text-xs text-red-500 mt-1">
                            Resets monthly
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!canGenerate && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 text-lg">🚫</span>
                        <h4 className="font-semibold text-red-800">Generation Limit Reached</h4>
                      </div>
                      <div className="text-sm text-red-700 space-y-1">
                        {isAtDailyLimit && (
                          <div>• Daily limit: Resets in {resetInfo.hoursUntilMidnight} hours</div>
                        )}
                        {isAtMonthlyLimit && (
                          <div>• Monthly limit: Resets in {resetInfo.daysUntilNextMonth} days</div>
                        )}
                        {isAtPromptLimit && (
                          <div>• Prompt limit: Resets monthly with your subscription</div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleUpgrade}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Upgrade for More Images
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-700 text-sm font-medium mb-2">
                    {error}
                  </div>
                  {error.includes('limit') && !error.includes('characters') && (
                    <button
                      onClick={handleUpgrade}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your image
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate... e.g., 'A professional logo for a tech startup, modern and minimalist style, blue and white colors'"
                    className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent min-h-[4rem] max-h-32"
                    rows={3}
                    disabled={isGenerating || !canGenerate}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific and detailed for best results ({prompt.length}/4000 characters)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      disabled={isGenerating || !canGenerate}
                    >
                      <option value="1024x1024">Square (1024×1024)</option>
                      <option value="1024x1792">Portrait (1024×1792)</option>
                      <option value="1792x1024">Landscape (1792×1024)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      disabled={isGenerating || !canGenerate}
                    >
                      <option value="vivid">Vivid (More Creative)</option>
                      <option value="natural">Natural (More Realistic)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || !canGenerate}
                    className="flex-1 px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Generating...
                      </>
                    ) : !canGenerate ? (
                      'Limit Reached'
                    ) : (
                      <>
                        <FaMagic />
                        Generate Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get reset date
const getResetDate = (subscriptionType: string) => {
  const now = new Date()
  if (subscriptionType?.toLowerCase() === 'free') {
    // Daily reset at midnight
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  } else {
    // Monthly reset on the 1st
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth
  }
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user, setUser } = useUserStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  const promptLimit = PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || 'free'] || 20
  const promptsUsed = user?.promptsUsed ?? 0
  const promptsRemaining = Math.max(0, promptLimit - promptsUsed)
  const isAtPromptLimit = promptsUsed >= promptLimit

  // States
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [imageUsage, setImageUsage] = useState<ImageUsage | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [currentSaveMessageId, setCurrentSaveMessageId] = useState<string | null>(null)
  const [currentFeedbackMessageId, setCurrentFeedbackMessageId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [disableAutoScroll, setDisableAutoScroll] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const lastScrollTop = useRef<number>(0)

  // Copy message handler
  const handleCopyMessage = async (messageId: string, content: string) => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    }
  }

  // Load dashboard conversations from DB
  const loadDashboardConversationsFromDB = async () => {
    if (!token) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/dashboard-history`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          console.log('✅ Loaded user-specific messages from database:', data.messages.length)
          setMessages(data.messages.slice(-MAX_PERSISTENT_MESSAGES))
        } else {
          console.log('✅ No previous messages for this user')
          setMessages([])
        }
      } else {
        console.log('No dashboard history found or error loading')
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to load dashboard conversations from DB:', err)
      setMessages([])
    }
  }

  // Load user's private messages on mount
  useEffect(() => {
    if (token) {
      loadDashboardConversationsFromDB()
    }
  }, [token])

  // Helper function for creating files from base64 previews
  const createFileFromPreview = (preview: string, name: string, type: string): File => {
    const arr = preview.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || type
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new File([u8arr], name, { type: mime })
  }

  // Clear conversations
  const createNewConversation = () => {
    setMessages([])
    setError(null)
    setInput('')
    setUploadedFiles([])
  }

  // Enhanced image usage fetching with new limits
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/dalle/usage`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .then(data => {
          if (data && !data.error && data.dailyImages && data.monthlyImages && data.totalPrompts) {
            setImageUsage(data)
          } else {
            const subType = user?.subscriptionType?.toLowerCase() || 'free'
            const limits = IMAGE_LIMITS[subType] || IMAGE_LIMITS.free
            setImageUsage({
              subscriptionType: subType,
              subscriptionName: subType.charAt(0).toUpperCase() + subType.slice(1),
              dailyImages: { used: 0, limit: limits.daily, remaining: limits.daily },
              monthlyImages: { used: 0, limit: limits.monthly, remaining: limits.monthly },
              totalPrompts: { used: promptsUsed, limit: promptLimit, remaining: promptLimit - promptsUsed },
              canGenerate: true,
              _fallback: true
            })
          }
        })
        .catch(err => {
          console.error('❌ Failed to fetch image usage:', err)
          const limits = IMAGE_LIMITS.free
          setImageUsage({
            subscriptionType: 'free',
            subscriptionName: 'Free',
            dailyImages: { used: 0, limit: limits.daily, remaining: limits.daily },
            monthlyImages: { used: 0, limit: limits.monthly, remaining: limits.monthly },
            totalPrompts: { used: promptsUsed, limit: promptLimit, remaining: promptLimit - promptsUsed },
            canGenerate: true,
            _fallback: true
          })
        })
    }
  }, [token, promptsUsed, promptLimit, user?.subscriptionType])

  // Enhanced user data fetching
  useEffect(() => {
    if (!token) {
      router.push('/onboarding')
      return
    }
    
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
          
          if (response.status === 401) {
            localStorage.removeItem('growfly_jwt')
            router.push('/onboarding')
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error)
      }
    }
    
    fetchUserData()
    const syncInterval = setInterval(fetchUserData, 60000)
    
    return () => clearInterval(syncInterval)
  }, [token, router, setUser])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowHelpModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      
      const scrollHeight = textareaRef.current.scrollHeight
      const lineHeight = 24
      const maxLines = 4
      const maxHeight = lineHeight * maxLines
      
      const newHeight = Math.min(scrollHeight, maxHeight)
      textareaRef.current.style.height = newHeight + 'px'
    }
  }, [input])

  // Improved scroll handling - detect manual scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop
      const maxScroll = container.scrollHeight - container.clientHeight
      
      // If user scrolled up manually, disable auto-scroll
      if (currentScrollTop < lastScrollTop.current && currentScrollTop < maxScroll - 100) {
        setDisableAutoScroll(true)
        setIsUserScrolling(true)
      }
      
      // If user scrolled to bottom, re-enable auto-scroll
      if (currentScrollTop >= maxScroll - 50) {
        setDisableAutoScroll(false)
        setIsUserScrolling(false)
      }
      
      lastScrollTop.current = currentScrollTop

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

  // Better auto-scroll logic
  useEffect(() => {
    if (!disableAutoScroll && !isUserScrolling && (isStreaming || messages.length > 0)) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ 
          behavior: isStreaming ? 'auto' : 'smooth',
          block: 'end'
        })
      }, 100)
    }
  }, [messages, disableAutoScroll, isUserScrolling, isStreaming])

  // Enhanced file handling with drag & drop
  const handleFileSelect = (files: FileList) => {
    Array.from(files).forEach(file => {
      // Enhanced file size limit (25MB for documents, 10MB for images)
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 25 * 1024 * 1024
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024))
        setError(`File ${file.name} is too large. Maximum size is ${sizeMB}MB.`)
        return
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
      }

      // Enhanced file preview support
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, preview: e.target?.result as string } : f
          ))
        }
        reader.readAsDataURL(file)
      } else if (file.type === 'application/pdf') {
        newFile.content = `PDF file: ${file.name}`
      } else if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        newFile.content = `Excel file: ${file.name}`
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        newFile.content = `Word document: ${file.name}`
      } else if (file.type.includes('presentation') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        newFile.content = `PowerPoint presentation: ${file.name}`
      }

      setUploadedFiles(prev => [...prev, newFile])
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
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
      
      if (rawFollowUps.length > 0) {
        return [rawFollowUps[0]]
      }
      
      if (text.toLowerCase().includes('marketing')) {
        return ['How can I measure the success of these marketing strategies?']
      } else if (text.toLowerCase().includes('business') || text.toLowerCase().includes('improve')) {
        return ['What would be the first step to implement this improvement?']
      } else if (text.toLowerCase().includes('document') || text.toLowerCase().includes('create')) {
        return ['Can you help me customize this for my specific industry?']
      } else {
        return ['Can you provide more specific examples for my situation?']
      }
    } catch {
      return ['Tell me more about how to implement this']
    }
  }

  // Enhanced handleStream with conversation context and files
  const handleStreamWithFiles = async (prompt: string, aId: string, files: File[] = []) => {
    let fullContent = ''
    let followUps: string[] = []
    setIsLoading(true)
    setIsStreaming(true)
    setError(null)

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === aId ? { ...msg, content: '' } : msg
      )
    )

    try {
      // Prepare conversation history for backend
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      console.log('🔍 Sending conversation history:', conversationHistory.length, 'messages')

      await streamChat({
        prompt,
        token,
        files,
        conversationHistory, // Now sending to backend!
        onStream: (chunk: any) => {
          if (chunk.content) {
            fullContent += chunk.content
            
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

          if (chunk.processedFiles) {
            console.log('📁 Processed files:', chunk.processedFiles)
          }
        },
        onComplete: async () => {
          setIsLoading(false)
          setIsStreaming(false)
          
          if (!followUps.length && fullContent.trim()) {
            followUps = await fetchFollowUps(fullContent)
          }
          
          if (!followUps.length) {
            followUps = ['Tell me more about this']
          }
          
          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === aId ? { ...msg, content: fullContent, followUps } : msg
            )
            const trimmed = updated.slice(-MAX_PERSISTENT_MESSAGES)
            return trimmed
          })
          
          try {
            await fetch(`${API_BASE_URL}/api/chat/save-to-dashboard`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                userMessage: prompt,
                assistantMessage: fullContent,
              }),
            })
          } catch (saveError) {
            console.error('Failed to save to dashboard history:', saveError)
          }
          
          if (user) {
            const newPromptsUsed = (user.promptsUsed ?? 0) + 1
            const newXP = (user.totalXP ?? 0) + 2.5
            
            setUser({
              ...user,
              promptsUsed: newPromptsUsed,
              totalXP: newXP,
            })
            
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
                const freshDataResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                
                if (freshDataResponse.ok) {
                  const freshUserData = await freshDataResponse.json()
                  setUser(freshUserData)
                }
              }
            } catch (error) {
              console.error('❌ Database sync error:', error)
            }
          }
        },
        onError: (error: any) => {
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

  // Enhanced handleSubmit
  const handleSubmit = async (override?: string) => {
    const text = override || input.trim()
    if (!text && uploadedFiles.length === 0) return

    setError(null)

    if (promptsUsed >= promptLimit) {
      const planType = user?.subscriptionType?.toLowerCase() || 'free'
      const resetDate = getResetDate(planType)
      const periodText = planType === 'free' ? 'daily' : 'monthly'
      const resetDateText = resetDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
      
      setError(`You've reached your ${periodText} limit of ${promptLimit} prompts. Resets on ${resetDateText}. Upgrade your plan to continue.`)
      return
    }

    const uId = `u${Date.now()}`
    const userMessage: Message = { 
      id: uId, 
      role: 'user' as const, 
      content: text,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    }
    
    setMessages((prev) => {
      const updated = [...prev, userMessage]
      return updated.slice(-MAX_PERSISTENT_MESSAGES)
    })
    setInput('')
    
    const aId = `a${Date.now()}`
    setMessages((prev) => {
      const updated = [...prev, { id: aId, role: 'assistant', content: '' } as Message]
      return updated.slice(-MAX_PERSISTENT_MESSAGES)
    })

    const filesToSend: File[] = []
    
    for (const uploadedFile of uploadedFiles) {
      if (uploadedFile.file) {
        filesToSend.push(uploadedFile.file)
      } else if (uploadedFile.preview && uploadedFile.type.startsWith('image/')) {
        const file = createFileFromPreview(uploadedFile.preview, uploadedFile.name, uploadedFile.type)
        filesToSend.push(file)
      }
    }

    setUploadedFiles([])
    handleStreamWithFiles(text, aId, filesToSend)
  }

  const handleSaveResponse = async (title: string, messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId)
      if (!message || message.role !== 'assistant') {
        throw new Error('Invalid message to save')
      }

      const response = await fetch(`${API_BASE_URL}/api/saved`, {
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

  const handleSaveToCollabZone = async (title: string, messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId)
      if (!message || message.role !== 'assistant') {
        throw new Error('Invalid message to save')
      }

      const response = await fetch(`${API_BASE_URL}/api/collab`, {
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
      
      setShowSaveModal(false)
      setCurrentSaveMessageId(null)
      
      return result
    } catch (error) {
      console.error('Error saving to Collab Zone:', error)
      setError('Failed to save to Collab Zone. Please try again.')
      return null
    }
  }

  const handleShareToCollabZone = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    try {
      const autoTitle = `Shared Response - ${new Date().toLocaleDateString()}`
      const result = await handleSaveToCollabZone(autoTitle, messageId)
      
      if (result) {
        router.push(`/collab-zone?document=${result.id}`)
      }
    } catch (error) {
      console.error('Error sharing to Collab Zone:', error)
      setError('Failed to share to Collab Zone. Please try again.')
    }
  }

  const handleImageGenerated = (image: GeneratedImage) => {
    console.log('🎨 Image generated:', image.id)
    
    setGeneratedImages(prev => [image, ...prev])
    
    const imageMessageId = `img_${Date.now()}`
    const imageMessage: Message = {
      id: imageMessageId,
      role: 'assistant',
      content: `I've created an image for you: "${image.originalPrompt}"`,
      generatedImage: image,
      followUps: [
        'Can you create a variation of this image?'
      ]
    }
    
    setMessages(prev => {
      const updated = [...prev, imageMessage]
      const trimmed = updated.slice(-MAX_PERSISTENT_MESSAGES)
      return trimmed
    })
    
    if (token) {
      fetch(`${API_BASE_URL}/api/dalle/usage`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then(data => {
          if (data && !data.error && data.dailyImages && data.monthlyImages) {
            setImageUsage(data)
          }
        })
        .catch(err => console.error('Failed to refresh image usage:', err))
    }
  }

  const handleDownloadImage = (image: GeneratedImage) => {
    try {
      const link = document.createElement('a')
      link.href = image.url
      link.download = `growfly-${image.id}.png`
      link.target = '_blank'
      link.click()
    } catch (error) {
      console.error('Failed to download image:', error)
      window.open(image.url, '_blank')
    }
  }

  const handleShareImage = (image: GeneratedImage) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this AI-generated image!',
        text: image.originalPrompt,
        url: image.url
      })
    } else {
      navigator.clipboard.writeText(image.url)
      alert('Image URL copied to clipboard!')
    }
  }

  const dismissError = () => setError(null)

  return (
    <div 
      className="h-screen bg-gray-50 text-gray-900 transition-colors duration-300 flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-dashed border-gray-500 max-w-md text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Drop Files Here</h3>
            <p className="text-gray-600">
              Support for images, PDF, Word, Excel, PowerPoint
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Up to 25MB per document, 10MB per image
            </p>
          </div>
        </div>
      )}
      
      {/* Content Area - Proper sidebar spacing */}
      <div className="flex-1 overflow-hidden ml-0 md:ml-60 lg:ml-64">
        <div ref={containerRef} className="h-full overflow-y-auto pb-80 pl-2 pr-4">

        {/* Prompt Limit Warning */}
        {isAtPromptLimit && (
          <div className="mr-4 mt-4 ml-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm relative">
            <button 
              onClick={dismissError}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <HiX className="w-4 h-4" />
            </button>
            <strong>🚫 Prompt Limit Reached</strong>
            <p className="mt-2">
              You've used all {promptLimit} prompts for your {user?.subscriptionType?.toLowerCase() || 'free'} plan.
            </p>
            <p className="text-sm mt-1">
              Resets: {getResetDate(user?.subscriptionType?.toLowerCase() || 'free').toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
            <div className="mt-3">
              <button
                onClick={() => router.push('/change-plan')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mr-4 mt-4 ml-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm relative">
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

        {/* Info about persistent conversations */}
        {messages.length > 0 && (
          <div className="mr-4 mt-4 ml-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            <p className="text-gray-800 text-sm flex items-center gap-2">
              <span className="text-lg">💡</span>
              <strong>Your conversations are securely saved!</strong> Your last 10 exchanges stay private to your account on this dashboard.
            </p>
          </div>
        )}

        {/* Chat Messages - Clean layout with proper spacing */}
        <div className="space-y-4 min-h-0 flex-1 pt-4 pr-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <div className="text-center max-w-2xl px-4">
                <div className="mb-6">
                  <div className="text-6xl md:text-8xl mb-4 animate-bounce">👋</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    Welcome to Growfly! 🚀
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
                    Your AI business assistant is ready to help you grow, optimize, and succeed. 
                    Start by choosing a quick prompt or asking any business question.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="text-xl mb-2">💡</div>
                    <h4 className="font-semibold text-gray-900 text-sm">Smart Suggestions</h4>
                    <p className="text-xs text-gray-700 mt-1">Get AI-powered business insights</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="text-xl mb-2">📁</div>
                    <h4 className="font-semibold text-gray-900 text-sm">Enhanced File Support</h4>
                    <p className="text-xs text-gray-700 mt-1">Drag & drop Excel, Word, PowerPoint files</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">K</kbd>
                    <span>Quick shortcuts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Ready to help</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex mb-4 ${
                msg.role === 'user' 
                  ? 'justify-end' 
                  : 'justify-start'
              }`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* MESSAGES: Proper layout without negative margins */}
              <div
                className={`relative rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white max-w-[80%] sm:max-w-[70%] ml-auto p-4'
                    : 'bg-white border border-gray-200 text-gray-800 max-w-[90%] sm:max-w-[80%] py-4 px-2'
                }`}
              >
                {/* Display uploaded files for user messages */}
                {msg.role === 'user' && msg.files && msg.files.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs text-blue-200 font-medium">📎 Attached Files:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.files.map((file) => (
                        <div key={file.id} className="bg-blue-500 rounded-lg p-2 flex items-center gap-2">
                          {file.type.startsWith('image/') && file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
                          ) : file.type === 'application/pdf' ? (
                            <FaFilePdf className="w-6 h-6 text-blue-200" />
                          ) : (
                            <FaFileAlt className="w-6 h-6 text-blue-200" />
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

                {/* Generated images */}
                {msg.generatedImage && (
                  <div className="mb-4">
                    <SafeImage
                      src={msg.generatedImage.url}
                      alt={msg.generatedImage.originalPrompt}
                      className="w-full max-w-lg rounded-xl shadow-lg"
                      onError={() => {
                        console.error('Failed to load generated image:', msg.generatedImage?.url)
                      }}
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleDownloadImage(msg.generatedImage!)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <FaFileDownload />
                        Download
                      </button>
                      <button
                        onClick={() => router.push('/gallery')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <FaImages />
                        Gallery
                      </button>
                      <button
                        onClick={() => handleShareImage(msg.generatedImage!)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <FaShareSquare />
                        Share
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p><strong>Size:</strong> {msg.generatedImage.size} • <strong>Style:</strong> {msg.generatedImage.style}</p>
                      <p><strong>Created:</strong> {new Date(msg.generatedImage.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content ? (
                    <div className="prose prose-sm max-w-none">
                      {msg.content}
                    </div>
                  ) : msg.role === 'assistant' && (isLoading || isStreaming) ? (
                    <div className="flex items-center gap-3 text-gray-600 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                      <span className="animate-pulse text-sm font-medium">Thinking...</span>
                    </div>
                  ) : ''}
                </div>

                {msg.role === 'assistant' && msg.content && (
                  <>
                    {/* Follow-up Questions */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">💡</span>
                          <span className="text-xs font-medium text-gray-700">Continue the conversation:</span>
                        </div>
                        <div className="space-y-2">
                          {msg.followUps.map((followUp, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.preventDefault()
                                const cleanFollowUp = followUp.replace(/^\s*[\(\)]\s*/, '').trim()
                                handleSubmit(cleanFollowUp)
                              }}
                              disabled={isLoading || isStreaming}
                              className="w-full bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 text-gray-700 hover:text-gray-800 disabled:text-gray-500 p-0 rounded-lg text-sm font-medium shadow-sm hover:shadow-md border border-gray-200 disabled:border-gray-200 transition-all duration-200 hover:scale-[1.01] disabled:transform-none disabled:cursor-not-allowed text-left focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                            >
                              <div className="px-3 py-2">
                                {followUp.replace(/^\s*[\(\)]\s*/, '').trim()}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons - Clean outlined style */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                      <div className="relative">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className={`p-0 md:p-0 rounded-lg border transition-all duration-200 transform hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                            copiedMessageId === msg.id 
                              ? 'text-green-600 bg-green-50 border-green-200' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 bg-gray-50'
                          }`}
                          title="Copy message"
                        >
                          <div className="p-2 md:p-1.5">
                            <FaCopy className="w-4 h-4" />
                          </div>
                        </button>
                        {copiedMessageId === msg.id && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
                            Copied!
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setCurrentFeedbackMessageId(msg.id)
                          setShowFeedbackModal(true)
                        }}
                        className="p-0 md:p-0 rounded-lg border border-gray-200 text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-all duration-200 transform hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 bg-gray-50"
                        title="Like this response"
                      >
                        <div className="p-2 md:p-1.5">
                          <HiThumbUp className="w-4 h-4" />
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentFeedbackMessageId(msg.id)
                          setShowFeedbackModal(true)
                        }}
                        className="p-0 md:p-0 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 transform hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 bg-gray-50"
                        title="Dislike this response"
                      >
                        <div className="p-2 md:p-1.5">
                          <HiThumbDown className="w-4 h-4" />
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentSaveMessageId(msg.id)
                          setShowSaveModal(true)
                        }}
                        className="p-0 md:p-0 rounded-lg border border-gray-200 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200 transition-all duration-200 transform hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 bg-gray-50"
                        title="Save to Saved Responses"
                      >
                        <div className="p-2 md:p-1.5">
                          <FaRegBookmark className="w-4 h-4" />
                        </div>
                      </button>
                      <button
                        onClick={() => handleShareToCollabZone(msg.id)}
                        className="p-0 md:p-0 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 bg-gray-50"
                        title="Share to Collab Zone"
                      >
                        <div className="p-2 md:p-1.5">
                          <FaShareSquare className="w-4 h-4" />
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            ))}
            <div ref={chatEndRef} className="h-8" />
            </>
          )}
        </div>
        </div>
      </div>

      {/* File Upload Preview */}
      {uploadedFiles.length > 0 && (
        <div className="fixed bottom-36 left-4 right-4 md:left-60 lg:left-64 px-2 z-30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  📎 Attached Files ({uploadedFiles.length})
                </h4>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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

      {/* Floating Input Section */}
      <div className="fixed bottom-0 left-4 right-4 md:left-60 lg:left-64 z-20 p-3">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="mb-3 flex items-center justify-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘/</kbd>
                <span>Help</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⏎</kbd>
                <span>Send</span>
              </div>
            </div>
          )}
          
          <div className="flex items-end gap-2 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-gray-200/50">
            
            <button
              onClick={(e) => {
                e.preventDefault()
                if (!isLoading && !isStreaming && fileInputRef.current) {
                  fileInputRef.current.click()
                }
              }}
              disabled={isLoading || isStreaming || isAtPromptLimit}
              className={`p-0 md:p-0 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all duration-200 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                isLoading || isStreaming || isAtPromptLimit
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-95'
              }`}
            >
              <div className="p-2 md:p-1.5">
                <FaPaperclip className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Upload</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (imageUsage?.canGenerate && (imageUsage?.dailyImages?.remaining || 0) > 0) {
                  setShowImageModal(true)
                } else {
                  router.push('/change-plan')
                }
              }}
              disabled={isAtPromptLimit}
              className={`p-0 md:p-0 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all duration-200 touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                (imageUsage?.canGenerate && (imageUsage?.dailyImages?.remaining || 0) > 0 && !isAtPromptLimit)
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-95'
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              <div className="p-2 md:p-1.5">
                <FaPalette className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">
                  {(imageUsage?.canGenerate && (imageUsage?.dailyImages?.remaining || 0) > 0 && !isAtPromptLimit) ? 'Image' : 'Upgrade'}
                </span>
              </div>
            </button>

            <div className="flex-1 relative flex items-center">
              <textarea
                ref={textareaRef}
                rows={1}
                className="w-full px-3 py-2.5 border-0 bg-transparent text-gray-900 resize-none text-sm min-h-[40px] max-h-[100px] transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                placeholder={messages.length === 0 
                  ? "Ask me anything about your business..." 
                  : "Continue the conversation..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                disabled={isLoading || isStreaming || isAtPromptLimit}
              />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading || isStreaming || isAtPromptLimit}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white p-0 md:p-0 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl active:scale-95 disabled:transform-none disabled:shadow-none flex-shrink-0 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {isLoading || isStreaming ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
            
            <input
              type="file"
              accept="image/*,application/pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/msword"
              onChange={(e) => {
                const files = e.target.files
                if (files) handleFileSelect(files)
              }}
              className="hidden"
              ref={fileInputRef}
              disabled={isLoading || isStreaming || isAtPromptLimit}
              multiple
            />
          </div>
        </div>
      </div>

      {/* Help Button */}
      <div className="fixed right-4 bottom-20 z-30">
        <button
          onClick={() => setShowHelpModal(true)}
          disabled={isLoading || isStreaming}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white p-0 md:p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none w-12 h-12 md:w-10 md:h-10 flex items-center justify-center touch-manipulation focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          title="Quick Start Guide"
        >
          <FaQuestionCircle className="w-5 h-5 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl mx-4 w-full max-h-[90vh] overflow-y-auto border border-gray-200/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    🚀 Quick Start Hub
                  </h2>
                  <p className="text-gray-600">
                    Choose from these proven business prompts to get immediate value from Growfly
                  </p>
                </div>
                <button 
                  onClick={() => setShowHelpModal(false)} 
                  className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    handleSubmit("What are some effective marketing strategies for my business that I can implement this month?")
                    setShowHelpModal(false)
                  }}
                  disabled={isLoading || isStreaming || isAtPromptLimit}
                  className="group p-6 text-left bg-gray-50 rounded-3xl hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">📈</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Marketing Strategies</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Get actionable marketing ideas, campaign strategies, and customer acquisition tactics you can implement immediately to grow your business.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Social Media</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Content Strategy</span>
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleSubmit("Analyze my business operations and suggest 3 specific improvements I can make this week.")
                    setShowHelpModal(false)
                  }}
                  disabled={isLoading || isStreaming || isAtPromptLimit}
                  className="group p-6 text-left bg-gray-50 rounded-3xl hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">⚡</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Business Optimization</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Identify bottlenecks, streamline processes, and find quick wins to improve efficiency, reduce costs, and boost productivity.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Process Improvement</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Cost Reduction</span>
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleSubmit("Help me create a compelling business proposal for a potential client or investor.")
                    setShowHelpModal(false)
                  }}
                  disabled={isLoading || isStreaming || isAtPromptLimit}
                  className="group p-6 text-left bg-gray-50 rounded-3xl hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">📊</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Business Proposals</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Create compelling proposals, pitch decks, and business documents that win clients and secure funding opportunities.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Proposals</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Pitch Decks</span>
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleSubmit("What are the current trends in my industry and how can I capitalize on them?")
                    setShowHelpModal(false)
                  }}
                  disabled={isLoading || isStreaming || isAtPromptLimit}
                  className="group p-6 text-left bg-gray-50 rounded-3xl hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🎯</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Industry Analysis</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Stay ahead of the competition with insights into industry trends, market opportunities, and strategic positioning.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Market Research</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Competitive Analysis</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  ⚡ Pro Tips for Better Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 text-lg">💡</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Be Specific</h4>
                      <p className="text-gray-600">Include your industry, company size, and specific goals for more tailored advice.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 text-lg">📁</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Upload Files</h4>
                      <p className="text-gray-600">Share documents, spreadsheets, or presentations for analysis and insights.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 text-lg">🎨</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Create Images</h4>
                      <p className="text-gray-600">Generate professional visuals for marketing, presentations, and social media.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 text-lg">🔖</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Save Responses</h4>
                      <p className="text-gray-600">Bookmark useful responses to access them anytime in your saved collection.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Generation Modal */}
      <ImageGenerationModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageGenerated={handleImageGenerated}
      />

      {/* Save Modal */}
      {showSaveModal && currentSaveMessageId && (
        <SaveModal
          open={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
            setCurrentSaveMessageId(null)
          }}
          messageId={currentSaveMessageId}
          onSaveResponse={handleSaveResponse}
          onSaveToCollabZone={handleSaveToCollabZone}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && currentFeedbackMessageId && (
        <FeedbackModal
          open={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false)
            setCurrentFeedbackMessageId(null)
          }}
          responseId={currentFeedbackMessageId}
        />
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}