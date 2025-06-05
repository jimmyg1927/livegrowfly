// File: components/ImageGeneration/ImageGallery.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaImages, FaDownload, FaTrash, FaTimes, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

interface ImageGalleryProps {
  isOpen: boolean
  onClose: () => void
}

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  size: string
  quality: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ isOpen, onClose }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 })
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen, pagination.page])

  const loadImages = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dalle/images?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load images')
      }

      const data = await response.json()
      setImages(data.images)
      setPagination(data.pagination)

    } catch (error: any) {
      console.error('Failed to load images:', error)
      setError('Failed to load your images. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `growfly-${image.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to download image')
      setTimeout(() => setError(null), 3000)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId))
      setSelectedImage(null)
      
      // Reload if current page is empty
      if (images.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }))
      } else {
        loadImages()
      }

    } catch (error) {
      console.error('Delete failed:', error)
      setError('Failed to delete image')
      setTimeout(() => setError(null), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

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
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaImages className="text-blue-500" />
                Your Generated Images
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {pagination.total} images total
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading images...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && images.length === 0 && (
            <div className="text-center py-12">
              <FaImages className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No images generated yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Generate your first image to see it here!
              </p>
            </div>
          )}

          {/* Images Grid */}
          {!loading && images.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                  ></motion.div>