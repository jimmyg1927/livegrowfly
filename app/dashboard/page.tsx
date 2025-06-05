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
  FaPaperclip,
  FaFileExcel,
  FaPalette,
  FaImages,
  FaSpinner,
  FaMagic
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
  file?: File // ✅ NEW: Store the actual File object
}

// ✅ NEW: DALL-E Image interface
interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  revisedPrompt: string
  size: string
  quality: string
  style: string
  createdAt: string
}

// ✅ UPDATED: Enhanced DALL-E Usage interface to match backend
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
}

const PROMPT_LIMITS: Record<string, number> = {
  free: 20,
  personal: 400,
  business: 2000,
}

// ✅ UPDATED: Image limits to match backend
const IMAGE_LIMITS: Record<string, { daily: number; monthly: number }> = {
  free: { daily: 2, monthly: 10 },           // Matches backend
  pro: { daily: 20, monthly: 200 },          // Matches backend  
  business: { daily: 50, monthly: 1000 },    // Matches backend
  enterprise: { daily: -1, monthly: -1 }     // Unlimited
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

// ✅ ENHANCED: Image Generation Modal with better error handling and upgrade prompts
const ImageGenerationModal: React.FC<{
  open: boolean
  onClose: () => void
  onImageGenerated: (image: GeneratedImage) => void
}> = ({ open, onClose, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [style, setStyle] = useState('vivid')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [imageUsage, setImageUsage] = useState<ImageUsage | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''
  const router = useRouter()

  // Fetch usage stats when modal opens
  useEffect(() => {
    if (open && token) {
      fetch(`${API_BASE_URL}/api/dalle/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('📊 Image usage data:', data)
          setImageUsage(data)
        })
        .catch(err => console.error('Failed to fetch image usage:', err))
    }
  }, [open, token])

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 3) {
      setError('Prompt must be at least 3 characters long')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, size, quality, style })
      })

      const data = await response.json()

      if (!response.ok) {
        // ✅ ENHANCED: Better error handling with upgrade suggestions
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

      // ✅ UPDATED: Handle new response structure
      const imageData = {
        id: data.imageId,
        url: data.imageUrl,
        originalPrompt: data.prompt,
        revisedPrompt: data.prompt, // Backend doesn't provide revised prompt yet
        size: size,
        quality: quality,
        style: style,
        createdAt: new Date().toISOString()
      }

      onImageGenerated(imageData)
      setPrompt('')
      onClose()

      // Refresh usage after successful generation
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

  // ✅ ENHANCED: Better limit checking with specific messaging
  const canGenerate = imageUsage?.canGenerate ?? false
  const isAtDailyLimit = imageUsage && imageUsage.dailyImages.remaining <= 0
  const isAtMonthlyLimit = imageUsage && imageUsage.monthlyImages.remaining <= 0
  const isAtPromptLimit = imageUsage && imageUsage.totalPrompts.remaining <= 0

  // ✅ NEW: Reset time calculations
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaPalette className="text-purple-500" />
              Generate Image with DALL-E
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* ✅ ENHANCED: Comprehensive Usage Display */}
          {imageUsage && (
            <div className="mb-6 space-y-4">
              {/* Current Plan Display */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                    {imageUsage.subscriptionName} Plan Limits
                  </h3>
                  {!canGenerate && (
                    <button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {/* Daily Images */}
                  <div className="text-center">
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Daily Images</div>
                    <div className={`font-bold text-lg ${isAtDailyLimit ? 'text-red-600' : 'text-purple-700 dark:text-purple-300'}`}>
                      {imageUsage.dailyImages.remaining}/{imageUsage.dailyImages.limit === -1 ? '∞' : imageUsage.dailyImages.limit}
                    </div>
                    {isAtDailyLimit && (
                      <div className="text-xs text-red-500 mt-1">
                        Resets in {resetInfo.hoursUntilMidnight}h
                      </div>
                    )}
                  </div>
                  
                  {/* Monthly Images */}
                  <div className="text-center">
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Monthly Images</div>
                    <div className={`font-bold text-lg ${isAtMonthlyLimit ? 'text-red-600' : 'text-blue-700 dark:text-blue-300'}`}>
                      {imageUsage.monthlyImages.remaining}/{imageUsage.monthlyImages.limit === -1 ? '∞' : imageUsage.monthlyImages.limit}
                    </div>
                    {isAtMonthlyLimit && (
                      <div className="text-xs text-red-500 mt-1">
                        Resets in {resetInfo.daysUntilNextMonth}d
                      </div>
                    )}
                  </div>
                  
                  {/* Total Prompts */}
                  <div className="text-center">
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Total Prompts</div>
                    <div className={`font-bold text-lg ${isAtPromptLimit ? 'text-red-600' : 'text-green-700 dark:text-green-300'}`}>
                      {imageUsage.totalPrompts.remaining}/{imageUsage.totalPrompts.limit === -1 ? '∞' : imageUsage.totalPrompts.limit}
                    </div>
                    {isAtPromptLimit && (
                      <div className="text-xs text-red-500 mt-1">
                        Resets monthly
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ NEW: Limit reached warnings with upgrade prompts */}
              {!canGenerate && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 text-lg">🚫</span>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">Generation Limit Reached</h4>
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
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
                    <a
                      href="/pricing"
                      target="_blank"
                      className="border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Plans
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="text-red-700 dark:text-red-300 text-sm font-medium mb-2">
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
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                disabled={isGenerating || !canGenerate}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Be specific and detailed for best results ({prompt.length}/4000 characters)
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={isGenerating || !canGenerate}
                >
                  <option value="1024x1024">Square (1024×1024)</option>
                  <option value="1024x1792">Portrait (1024×1792)</option>
                  <option value="1792x1024">Landscape (1792×1024)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={isGenerating || !canGenerate}
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD (Higher Cost)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={isGenerating || !canGenerate}
                >
                  <option value="vivid">Vivid (More Creative)</option>
                  <option value="natural">Natural (More Realistic)</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !canGenerate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  )
}

// ✅ UPDATED: Image Gallery Modal with correct API endpoint
const ImageGalleryModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  useEffect(() => {
    if (open && token) {
      setLoading(true)
      fetch(`${API_BASE_URL}/api/dalle/gallery?limit=20`, {  // ✅ FIXED: Correct endpoint
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('📸 Gallery data:', data)
          // ✅ UPDATED: Handle new backend response structure
          const galleryImages = data.images?.map((img: any) => ({
            id: img.id,
            url: img.imageUrl,
            originalPrompt: img.prompt,
            revisedPrompt: img.prompt, // Backend doesn't provide revised yet
            size: img.size,
            quality: img.quality,
            style: 'vivid', // Default if not provided
            createdAt: img.createdAt
          })) || []
          setImages(galleryImages)
        })
        .catch(err => console.error('Failed to fetch images:', err))
        .finally(() => setLoading(false))
    }
  }, [open, token])

  const handleDownloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `growfly-${image.id}.png`
    link.click()
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        setSelectedImage(null)
      }
    } catch (err) {
      console.error('Failed to delete image:', err)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaImages className="text-blue-500" />
              Your Generated Images
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <FaImages className="text-gray-400 text-6xl mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No images generated yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-gray-50 dark:bg-slate-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                >
                  <img
                    src={image.url}
                    alt={image.originalPrompt}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                      {image.originalPrompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                      <span>{image.size}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleDownloadImage(image)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Detail Modal */}
          {selectedImage && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Details</h3>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.originalPrompt}
                    className="w-full max-h-96 object-contain rounded-xl mb-4"
                  />
                  <div className="space-y-2 text-sm">
                    <div><strong>Original Prompt:</strong> {selectedImage.originalPrompt}</div>
                    <div><strong>Revised Prompt:</strong> {selectedImage.revisedPrompt}</div>
                    <div><strong>Size:</strong> {selectedImage.size} | <strong>Quality:</strong> {selectedImage.quality} | <strong>Style:</strong> {selectedImage.style}</div>
                    <div><strong>Created:</strong> {new Date(selectedImage.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleDownloadImage(selectedImage)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteImage(selectedImage.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

  // ✅ NEW: Image generation states
  const [showImageModal, setShowImageModal] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [imageUsage, setImageUsage] = useState<ImageUsage | null>(null)

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

  // ✅ Helper function for creating files from base64 previews
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

  // ✅ UPDATED: Enhanced image usage fetching
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/dalle/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('📊 Main dashboard image usage:', data)
          setImageUsage(data)
        })
        .catch(err => console.error('Failed to fetch image usage:', err))
    }
  }, [token])

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

  // ✅ UPDATED: Enhanced file handling to store File objects
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
        file: file, // ✅ Store the actual File object
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

  // ✅ NEW: Enhanced handleStream with file support
  const handleStreamWithFiles = async (prompt: string, aId: string, files: File[] = []) => {
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
        files, // ✅ NEW: Pass files to streamChat
        onStream: (chunk: any) => { // Use 'any' to avoid type errors
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

          // ✅ NEW: Handle processed files information
          if (chunk.processedFiles) {
            console.log('📁 Processed files:', chunk.processedFiles)
            // You can show user which files were processed successfully
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
        onError: (error: any) => {
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

  // ✅ UPDATED: Enhanced handleSubmit with proper file handling
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
    
    const aId = `a${Date.now()}`
    setMessages((prev) => [...prev, { id: aId, role: 'assistant', content: '' }])

    // ✅ ENHANCED: Convert uploaded files to proper File objects
    const filesToSend: File[] = []
    
    for (const uploadedFile of uploadedFiles) {
      if (uploadedFile.file) {
        // Use the stored File object
        filesToSend.push(uploadedFile.file)
      } else if (uploadedFile.preview && uploadedFile.type.startsWith('image/')) {
        // Fallback: Convert base64 preview to File object
        const file = createFileFromPreview(uploadedFile.preview, uploadedFile.name, uploadedFile.type)
        filesToSend.push(file)
      }
    }

    // Clear uploaded files after sending
    setUploadedFiles([])

    // ✅ SIMPLIFIED: Always use the new streamChat with files
    handleStreamWithFiles(text, aId, filesToSend)
  }

  // ✅ NEW: Download response as document
  const handleDownloadResponse = async (messageId: string, format: 'txt' | 'md' | 'html' = 'md') => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message.content,
          format,
          title: `Growfly Response - ${new Date().toLocaleDateString()}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate document')
      }

      const data = await response.json()
      
      // Create download link
      const blob = new Blob([data.content], { type: data.mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to download document. Please try again.')
    }
  }

  // ✅ NEW: Generate Excel from AI response
  const handleGenerateExcel = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    try {
      const response = await fetch(`${API_BASE_URL}/api/file-generation/excel/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: message.content,
          template: 'business',
          includeCharts: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate Excel')
      }

      // Handle file download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `growfly-analysis-${Date.now()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Excel generation failed:', error)
      setError('Failed to generate Excel file. Please try again.')
    }
  }

  // ✅ NEW: Generate PDF from AI response
  const handleGeneratePDF = async (messageId: string, template: string = 'professional') => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    try {
      const response = await fetch(`${API_BASE_URL}/api/file-generation/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message.content,
          title: `Growfly Document - ${new Date().toLocaleDateString()}`,
          template,
          documentType: 'report'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Handle file download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `growfly-document-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('PDF generation failed:', error)
      setError('Failed to generate PDF. Please try again.')
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

  // ✅ NEW: Refresh image usage after generation
  const handleImageGenerated = (image: GeneratedImage) => {
    setGeneratedImages(prev => [image, ...prev])
    // Refresh usage stats immediately
    if (token) {
      fetch(`${API_BASE_URL}/api/dalle/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setImageUsage(data))
        .catch(err => console.error('Failed to refresh image usage:', err))
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
        
        {/* ✅ ENHANCED: Header with Prompts Used, Image Usage, and Action Buttons */}
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
                {promptsUsed >= promptLimit && (
                  <span className="text-xs text-red-600 font-medium">
                    Limit reached
                  </span>
                )}
              </div>
            </div>

            {/* ✅ ENHANCED: Image Usage Tracker */}
            {imageUsage && (
              <div className="bg-white dark:bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Images</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out ${
                          imageUsage.dailyImages.remaining <= 0 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : imageUsage.dailyImages.remaining <= 2 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}
                        style={{ 
                          width: `${Math.min((imageUsage.dailyImages.used / (imageUsage.dailyImages.limit || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-800 min-w-[2.5rem]">
                      {imageUsage.dailyImages.remaining}/{imageUsage.dailyImages.limit === -1 ? '∞' : imageUsage.dailyImages.limit}
                    </span>
                    {imageUsage.dailyImages.remaining <= 0 && (
                      <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                        Resets in {Math.ceil((new Date().setHours(24,0,0,0) - Date.now()) / 3600000)}h
                      </span>
                    )}
                  </div>
                </div>
                {/* Monthly indicator */}
                <div className="text-xs text-gray-500 mt-1">
                  Monthly: {imageUsage.monthlyImages.remaining}/{imageUsage.monthlyImages.limit === -1 ? '∞' : imageUsage.monthlyImages.limit}
                </div>
              </div>
            )}

            {/* ✅ ENHANCED: DALL-E Button with limit checking */}
            <button
              onClick={() => {
                if (imageUsage?.canGenerate) {
                  setShowImageModal(true)
                } else {
                  // Show upgrade prompt if limits reached
                  router.push('/change-plan')
                }
              }}
              className={`text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105 ${
                imageUsage?.canGenerate 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-pointer hover:from-gray-500 hover:to-gray-600'
              }`}
              title={
                imageUsage?.canGenerate 
                  ? 'Generate a new image with DALL-E' 
                  : 'Upgrade to generate more images'
              }
            >
              <FaPalette className="text-xs" /> 
              {imageUsage?.canGenerate ? 'Generate Image' : 'Upgrade for Images'}
            </button>

            <button
              onClick={() => setShowImageGallery(true)}
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
            >
              <FaImages className="text-xs" /> Gallery
            </button>
            
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

                    {/* ✅ ENHANCED: Action Buttons with new file generation options */}
                    <div className="flex flex-wrap gap-4 mt-4 text-lg text-gray-500 dark:text-gray-400">
                      <HiThumbUp
                        className="cursor-pointer hover:text-green-500 transition-colors duration-200 transform hover:scale-110"
                        onClick={() => setShowFeedbackModal(true)}
                        title="Like this response"
                      />
                      <HiThumbDown
                        className="cursor-pointer hover:text-red-500 transition-colors duration-200 transform hover:scale-110"
                        onClick={() => setShowFeedbackModal(true)}
                        title="Dislike this response"
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
                      
                      {/* ✅ NEW: Enhanced download dropdown with Excel/PDF generation */}
                      <div className="relative group">
                        <FaFileDownload 
                          className="cursor-pointer hover:text-purple-500 transition-colors duration-200 transform hover:scale-110" 
                          title="Download & Generate Files"
                        />
                        {/* Enhanced download options dropdown */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[160px]">
                          <div className="p-2 space-y-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 border-b border-gray-200 dark:border-gray-600">
                              Documents
                            </div>
                            <button
                              onClick={() => handleDownloadResponse(msg.id, 'md')}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              📄 Markdown
                            </button>
                            <button
                              onClick={() => handleDownloadResponse(msg.id, 'txt')}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              📝 Text File
                            </button>
                            <button
                              onClick={() => handleDownloadResponse(msg.id, 'html')}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              🌐 HTML
                            </button>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 border-b border-gray-200 dark:border-gray-600 border-t mt-2 pt-2">
                              Smart Generation
                            </div>
                            <button
                              onClick={() => handleGenerateExcel(msg.id)}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              📊 Smart Excel
                            </button>
                            <button
                              onClick={() => handleGeneratePDF(msg.id, 'professional')}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              📋 Business PDF
                            </button>
                            <button
                              onClick={() => handleGeneratePDF(msg.id, 'executive')}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              💼 Executive Report
                            </button>
                          </div>
                        </div>
                      </div>

                      {msg.imageUrl && (
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = msg.imageUrl!
                            link.download = `growfly-image-${new Date().toISOString().split('T')[0]}.jpg`
                            link.click()
                          }}
                          className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 transform hover:scale-110"
                          title="Download image"
                        >
                          🖼️
                        </button>
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

      {/* ✅ NEW: DALL-E Image Generation Modal */}
      <ImageGenerationModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageGenerated={handleImageGenerated}
      />

      {/* ✅ NEW: Image Gallery Modal */}
      <ImageGalleryModal
        open={showImageGallery}
        onClose={() => setShowImageGallery(false)}
      />

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