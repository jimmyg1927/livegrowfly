'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  HiX,
  HiChevronDown,
} from 'react-icons/hi'
import { 
  FaImages, 
  FaSpinner, 
  FaShareSquare,
  FaDownload,
  FaTrash,
  FaPalette,
  FaFilter,
  FaSort,
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaCalendarAlt
} from 'react-icons/fa'

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

// ✅ Generated Image interface
interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  revisedPrompt: string
  size: string
  style: string
  createdAt: string
  isPinned?: boolean // Local state for pinning
}

// ✅ Sort and filter options
type SortOption = 'newest' | 'oldest' | 'prompt-az' | 'prompt-za' | 'size-large' | 'size-small'
type FilterOption = 'all' | 'pinned' | 'recent' | 'square' | 'portrait' | 'landscape'

// ✅ Image Detail Modal Component
const ImageDetailModal: React.FC<{
  image: GeneratedImage | null
  isOpen: boolean
  onClose: () => void
  onDelete: (imageId: string) => void
  onShare: (imageId: string) => void
  onPin: (imageId: string) => void
}> = ({ image, isOpen, onClose, onDelete, onShare, onPin }) => {
  if (!isOpen || !image) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `growfly-${image.id}.png`
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaEye className="text-blue-500" />
              Image Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Image */}
          <div className="mb-6 flex justify-center">
            <img
              src={image.url}
              alt={image.originalPrompt}
              className="max-w-full max-h-96 object-contain rounded-xl shadow-lg"
            />
          </div>

          {/* Image Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Original Prompt
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg text-sm">
                {image.originalPrompt}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Size
                </label>
                <p className="text-gray-900 dark:text-white font-medium">{image.size}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Style
                </label>
                <p className="text-gray-900 dark:text-white font-medium capitalize">{image.style}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Created
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => onPin(image.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                image.isPinned
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              {image.isPinned ? <FaHeart /> : <FaRegHeart />}
              {image.isPinned ? 'Unpin' : 'Pin'}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <FaDownload />
              Download
            </button>

            <button
              onClick={() => onShare(image.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <FaShareSquare />
              Share to Collab
            </button>

            <button
              onClick={() => onDelete(image.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ Delete Confirmation Modal
const DeleteConfirmModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  imageName: string
}> = ({ isOpen, onClose, onConfirm, imageName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <FaTrash className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Delete Image
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this image? This action cannot be undone.
            <br />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              &ldquo;{imageName}&rdquo;
            </span>
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ Main Gallery Component
export default function GalleryPage() {
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''
  
  // State management
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  const [pinnedImages, setPinnedImages] = useState<Set<string>>(new Set())

  // Load pinned images from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('growfly_pinned_images')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPinnedImages(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse pinned images:', e)
      }
    }
  }, [])

  // Save pinned images to localStorage
  const savePinnedImages = (newPinned: Set<string>) => {
    localStorage.setItem('growfly_pinned_images', JSON.stringify(Array.from(newPinned)))
  }

  // Fetch images from API
  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/dalle/gallery?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      const galleryImages = data.images?.map((img: any) => ({
        id: img.id,
        url: img.imageUrl,
        originalPrompt: img.prompt,
        revisedPrompt: img.prompt,
        size: img.size,
        style: img.style || 'vivid',
        createdAt: img.createdAt,
        isPinned: pinnedImages.has(img.id)
      })) || []

      setImages(galleryImages)
      setFilteredImages(galleryImages)
    } catch (err) {
      console.error('Failed to fetch images:', err)
      setError('Failed to load images. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      router.push('/onboarding')
      return
    }

    fetchImages()
  }, [token, router, pinnedImages])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...images]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (filterBy) {
      case 'pinned': {
        filtered = filtered.filter(img => pinnedImages.has(img.id))
        break
      }
      case 'recent': {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        filtered = filtered.filter(img => new Date(img.createdAt) > oneWeekAgo)
        break
      }
      case 'square': {
        filtered = filtered.filter(img => img.size === '1024x1024')
        break
      }
      case 'portrait': {
        filtered = filtered.filter(img => img.size === '1024x1792')
        break
      }
      case 'landscape': {
        filtered = filtered.filter(img => img.size === '1792x1024')
        break
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'prompt-az':
        filtered.sort((a, b) => a.originalPrompt.localeCompare(b.originalPrompt))
        break
      case 'prompt-za':
        filtered.sort((a, b) => b.originalPrompt.localeCompare(a.originalPrompt))
        break
      case 'size-large': {
        filtered.sort((a, b) => {
          const aSize = parseInt(a.size.split('x')[0]) * parseInt(a.size.split('x')[1])
          const bSize = parseInt(b.size.split('x')[0]) * parseInt(b.size.split('x')[1])
          return bSize - aSize
        })
        break
      }
      case 'size-small': {
        filtered.sort((a, b) => {
          const aSize = parseInt(a.size.split('x')[0]) * parseInt(a.size.split('x')[1])
          const bSize = parseInt(b.size.split('x')[0]) * parseInt(b.size.split('x')[1])
          return aSize - bSize
        })
        break
      }
    }

    setFilteredImages(filtered)
  }, [images, searchQuery, sortBy, filterBy, pinnedImages])

  // Handle pin/unpin
  const handlePin = (imageId: string) => {
    const newPinned = new Set(pinnedImages)
    if (newPinned.has(imageId)) {
      newPinned.delete(imageId)
    } else {
      newPinned.add(imageId)
    }
    setPinnedImages(newPinned)
    savePinnedImages(newPinned)

    // Update local state
    setImages(prev => prev.map(img => ({
      ...img,
      isPinned: img.id === imageId ? newPinned.has(imageId) : img.isPinned
    })))
  }

  // Handle share to collab zone
  const handleShare = async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/collab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Generated Image: ${image.originalPrompt.substring(0, 50)}...`,
          content: `![Generated Image](${image.url})\n\n**Prompt:** ${image.originalPrompt}\n\n**Details:**\n- Size: ${image.size}\n- Style: ${image.style}\n- Created: ${new Date(image.createdAt).toLocaleDateString()}`,
          type: 'image'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/collab-zone?document=${result.id}`)
      } else {
        throw new Error('Failed to share to Collab Zone')
      }
    } catch (error) {
      console.error('Error sharing to Collab Zone:', error)
      setError('Failed to share to Collab Zone. Please try again.')
    }
  }

  // Handle delete
  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        setShowDeleteModal(false)
        setImageToDelete(null)
        
        // Remove from pinned if it was pinned
        const newPinned = new Set(pinnedImages)
        newPinned.delete(imageId)
        setPinnedImages(newPinned)
        savePinnedImages(newPinned)
      } else {
        throw new Error('Failed to delete image')
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      setError('Failed to delete image. Please try again.')
    }
  }

  const confirmDelete = (imageId: string) => {
    setImageToDelete(imageId)
    setShowDeleteModal(true)
  }

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image)
    setShowDetailModal(true)
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaPalette className="text-purple-500" />
                Image Gallery
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and explore your AI-generated images
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredImages.length} of {images.length} images
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaPalette />
                Generate New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Images</option>
                <option value="pinned">Pinned</option>
                <option value="recent">Recent (7 days)</option>
                <option value="square">Square</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <FaSort className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="prompt-az">Prompt A-Z</option>
                <option value="prompt-za">Prompt Z-A</option>
                <option value="size-large">Largest First</option>
                <option value="size-small">Smallest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm relative">
            <button 
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <HiX className="w-4 h-4" />
            </button>
            <strong>⚠️ {error}</strong>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">Loading your images...</p>
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <FaImages className="text-gray-400 text-6xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || filterBy !== 'all' ? 'No images found' : 'No images generated yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start creating amazing images with AI'
              }
            </p>
            {!searchQuery && filterBy === 'all' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <FaPalette />
                Generate Your First Image
              </button>
            )}
          </div>
        ) : (
          /* Image Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Image */}
                <div 
                  className="relative aspect-square cursor-pointer overflow-hidden"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.url}
                    alt={image.originalPrompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <FaEye className="text-white text-2xl" />
                  </div>

                  {/* Pin indicator */}
                  {pinnedImages.has(image.id) && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                      <FaHeart className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                    {image.originalPrompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                    <span>{image.size}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePin(image.id)
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        pinnedImages.has(image.id)
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {pinnedImages.has(image.id) ? <FaHeart /> : <FaRegHeart />}
                      {pinnedImages.has(image.id) ? 'Unpin' : 'Pin'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const link = document.createElement('a')
                        link.href = image.url
                        link.download = `growfly-${image.id}.png`
                        link.click()
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded text-xs font-medium transition-colors"
                    >
                      <FaDownload />
                      Download
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(image.id)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 rounded text-xs font-medium transition-colors"
                    >
                      <FaShareSquare />
                      Share
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(image.id)
                      }}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete image"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      <ImageDetailModal
        image={selectedImage}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedImage(null)
        }}
        onDelete={confirmDelete}
        onShare={handleShare}
        onPin={handlePin}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setImageToDelete(null)
        }}
        onConfirm={() => {
          if (imageToDelete) {
            handleDelete(imageToDelete)
          }
        }}
        imageName={imageToDelete ? images.find(img => img.id === imageToDelete)?.originalPrompt.substring(0, 50) + '...' || '' : ''}
      />
    </div>
  )
}