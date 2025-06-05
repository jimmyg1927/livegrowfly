// File: components/ImageGeneration/ImageGenerator.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaImage, FaSpinner, FaDownload, FaSave, FaTimes } from 'react-icons/fa'
import { useUserStore } from '@lib/store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

interface ImageGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onImageGenerated?: (imageUrl: string) => void
}

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  size: string
  quality: string
  createdAt: string
}

interface Usage {
  dailyUsed: number
  dailyLimit: number
  monthlyUsed: number
  monthlyLimit: number
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ isOpen, onClose, onImageGenerated }) => {
  const { user } = useUserStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)

  // ✅ FIXED: Make loadUsageData a useCallback to satisfy ESLint dependency
  const loadUsageData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/limits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch (error) {
      console.error('Failed to load usage data:', error)
    }
  }, [token])

  // ✅ FIXED: Now loadUsageData is included in dependencies
  useEffect(() => {
    if (isOpen && token) {
      loadUsageData()
    }
  }, [isOpen, token, loadUsageData])

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your image')
      return
    }

    if (prompt.trim().length < 10) {
      setError('Description must be at least 10 characters long')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          quality
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setGeneratedImage(data.image)
      setUsage(data.usage)
      
      if (onImageGenerated) {
        onImageGenerated(data.image.url)
      }

    } catch (error: unknown) { // ✅ FIXED: Use unknown instead of any
      console.error('Image generation failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image'
      
      if (errorMessage.includes('limit')) {
        setError(errorMessage)
      } else {
        setError('Failed to generate image. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `growfly-image-${generatedImage.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to download image')
    }
  }

  const saveToGallery = async () => {
    // Image is automatically saved when generated
    setError('Image saved to your gallery!')
    setTimeout(() => setError(null), 2000)
  }

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 70) return 'text-yellow-500'
    return 'text-green-500'
  }

  const canGenerate = usage ? 
    usage.dailyUsed < usage.dailyLimit && usage.monthlyUsed < usage.monthlyLimit :
    true

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaImage className="text-blue-500" />
                Generate Image
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Create professional images for your business with AI
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {/* Usage Display */}
          {usage && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Image Generation Usage
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.subscriptionType} Plan
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily:</span>
                  <span className={getUsageColor(usage.dailyUsed, usage.dailyLimit)}>
                    {usage.dailyUsed}/{usage.dailyLimit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly:</span>
                  <span className={getUsageColor(usage.monthlyUsed, usage.monthlyLimit)}>
                    {usage.monthlyUsed}/{usage.monthlyLimit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A professional logo for a tech startup, modern and minimalist style, blue and white colors"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">
                {prompt.length}/500 characters (minimum 10)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={isGenerating}
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
                  disabled={isGenerating}
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD (Higher Quality)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={isGenerating || !canGenerate || prompt.trim().length < 10}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-6"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <FaImage />
                Generate Image
              </>
            )}
          </button>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="relative">
                <img
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  className="w-full rounded-lg shadow-lg"
                />
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FaDownload />
                    Download
                  </button>
                  <button
                    onClick={saveToGallery}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Saved!
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <p><strong>Prompt:</strong> {generatedImage.prompt}</p>
                <p><strong>Size:</strong> {generatedImage.size} • <strong>Quality:</strong> {generatedImage.quality}</p>
              </div>
            </div>
          )}

          {/* Upgrade Notice for Free Users */}
          {user?.subscriptionType === 'free' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Free Plan:</strong> 5 images per month. 
                <button className="underline ml-1 hover:text-blue-800">
                  Upgrade for more images
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ImageGenerator