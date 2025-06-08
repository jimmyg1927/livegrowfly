'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaImages, 
  FaSpinner, 
  FaDownload, 
  FaTrash, 
  FaEye, 
  FaCalendarAlt,
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaShare
} from 'react-icons/fa'

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

// ✅ Enhanced image interface with favorites and pins
interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  size: string
  createdAt: string
  isPinned?: boolean
  isFavorite?: boolean
}

// ✅ Enhanced Image Detail Modal with rounded corners
const ImageDetailModal: React.FC<{
  image: GeneratedImage | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onFavorite: (id: string) => void
}> = ({ image, isOpen, onClose, onDelete, onPin, onFavorite }) => {
  if (!isOpen || !image) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto mx-4 w-full">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Image Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200"
            >
              ✕
            </button>
          </div>

          {/* Image */}
          <div className="mb-6">
            <img
              src={image.url}
              alt={image.originalPrompt}
              className="w-full rounded-2xl shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl">
                {image.originalPrompt}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{image.size}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(image.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onPin(image.id)}
              className={`flex-1 px-4 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                image.isPinned
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              }`}
            >
              {image.isPinned ? <FaBookmark /> : <FaRegBookmark />}
              {image.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => onFavorite(image.id)}
              className={`flex-1 px-4 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                image.isFavorite
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300'
              }`}
            >
              {image.isFavorite ? <FaHeart /> : <FaRegHeart />}
              {image.isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = image.url
                link.download = `growfly-${image.id}.png`
                link.click()
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaDownload />
              Download
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this image permanently?')) {
                  onDelete(image.id)
                  onClose()
                }
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
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

// ✅ Enhanced Delete Confirmation Modal with rounded corners
const DeleteConfirmModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  imageName: string
}> = ({ isOpen, onClose, onConfirm, imageName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md mx-4 w-full">
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Delete Image
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete &ldquo;{imageName}&rdquo;? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  
  // ✅ Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'prompt' | 'size'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'pinned' | 'recent'>('all')
  const [sizeFilter, setSizeFilter] = useState<'all' | 'square' | 'portrait' | 'landscape'>('all')
  
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  // ✅ Enhanced image loading
  useEffect(() => {
    if (!token) {
      router.push('/onboarding')
      return
    }

    const fetchImages = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_BASE_URL}/api/dalle/gallery`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Transform the data to match our interface
        const transformedImages = (data.images || []).map((img: any) => ({
          id: img.id,
          url: img.imageUrl || img.url,
          originalPrompt: img.prompt || img.originalPrompt || 'No description',
          size: img.size || '1024x1024',
          createdAt: img.createdAt,
          isPinned: false, // You can add this to your backend later
          isFavorite: false // You can add this to your backend later
        }))

        setImages(transformedImages)
        setError(null)
      } catch (err) {
        console.error('❌ Failed to fetch images:', err)
        setError(err instanceof Error ? err.message : 'Failed to load images')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [token, router])

  // ✅ Filter and sort logic
  const filteredAndSortedImages = React.useMemo(() => {
    let filtered = images

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (filterBy) {
      case 'favorites': {
        filtered = filtered.filter(img => img.isFavorite)
        break
      }
      case 'pinned': {
        filtered = filtered.filter(img => img.isPinned)
        break
      }
      case 'recent': {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        filtered = filtered.filter(img => new Date(img.createdAt) > oneWeekAgo)
        break
      }
      default:
        break
    }

    // Apply size filter
    switch (sizeFilter) {
      case 'square': {
        filtered = filtered.filter(img => img.size.includes('1024x1024'))
        break
      }
      case 'portrait': {
        filtered = filtered.filter(img => img.size.includes('1024x1792'))
        break
      }
      case 'landscape': {
        filtered = filtered.filter(img => img.size.includes('1792x1024'))
        break
      }
      default:
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'date': {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      }
      case 'prompt': {
        filtered.sort((a, b) => a.originalPrompt.localeCompare(b.originalPrompt))
        break
      }
      case 'size': {
        filtered.sort((a, b) => a.size.localeCompare(b.size))
        break
      }
      default:
        break
    }

    return filtered
  }, [images, searchQuery, filterBy, sizeFilter, sortBy])

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image)
    setShowDetailModal(true)
  }

  const confirmDelete = (imageId: string) => {
    setImageToDelete(imageId)
    setShowDeleteModal(true)
  }

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/images/${imageId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId))
      setError(null)
    } catch (err) {
      console.error('❌ Failed to delete image:', err)
      setError('Failed to delete image. Please try again.')
    }
  }

  const handlePin = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isPinned: !img.isPinned } : img
    ))
  }

  const handleFavorite = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
    ))
  }

  const handleShare = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (image && navigator.share) {
      navigator.share({
        title: 'Check out this AI-generated image!',
        text: image.originalPrompt,
        url: image.url
      })
    } else if (image) {
      navigator.clipboard.writeText(image.url)
      alert('Image URL copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-6 space-y-6">
        
        {/* ✅ Enhanced header with rounded elements */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <FaImages className="text-purple-500" />
              Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your AI-generated image collection
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg">
            {filteredAndSortedImages.length} of {images.length} {images.length === 1 ? 'image' : 'images'}
          </div>
        </div>

        {/* ✅ Enhanced Search and Filters Bar with rounded corners */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:w-auto">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[120px]"
              >
                <option value="all">All Images</option>
                <option value="favorites">Favorites</option>
                <option value="pinned">Pinned</option>
                <option value="recent">Recent (7 days)</option>
              </select>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[120px]"
              >
                <option value="all">All Sizes</option>
                <option value="square">Square</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[120px]"
              >
                <option value="date">Sort by Date</option>
                <option value="prompt">Sort by Prompt</option>
                <option value="size">Sort by Size</option>
              </select>

              {(searchQuery || filterBy !== 'all' || sizeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterBy('all')
                    setSizeFilter('all')
                    setSortBy('date')
                  }}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-medium transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm relative">
            <button 
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-all duration-200"
            >
              ✕
            </button>
            <strong>⚠️ {error}</strong>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-purple-500 text-4xl mb-4 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">Loading your images...</p>
            </div>
          </div>
        ) : filteredAndSortedImages.length === 0 ? (
          /* ✅ Enhanced Empty State */
          <div className="text-center py-20">
            <FaImages className="text-gray-400 text-6xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || filterBy !== 'all' || sizeFilter !== 'all' 
                ? 'No images match your search' 
                : 'No images generated yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterBy !== 'all' || sizeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start creating amazing images with AI'
              }
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaImages />
              Generate Your First Image
            </button>
          </div>
        ) : (
          /* ✅ Enhanced Image Grid with rounded corners */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedImages.map((image) => (
              <div
                key={image.id}
                className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Image */}
                <div 
                  className="relative aspect-square cursor-pointer overflow-hidden"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.url}
                    alt={image.originalPrompt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <FaEye className="text-white text-2xl" />
                  </div>

                  {/* Pin/Favorite indicators */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {image.isPinned && (
                      <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                        <FaBookmark className="w-3 h-3" />
                      </div>
                    )}
                    {image.isFavorite && (
                      <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                        <FaHeart className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                    {image.originalPrompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      <FaCalendarAlt />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                      {image.size}
                    </span>
                  </div>

                  {/* ✅ Enhanced Actions with rounded corners */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePin(image.id)
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 ${
                        image.isPinned
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                      }`}
                    >
                      {image.isPinned ? <FaBookmark /> : <FaRegBookmark />}
                      Pin
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFavorite(image.id)
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200 ${
                        image.isFavorite
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                      }`}
                    >
                      {image.isFavorite ? <FaHeart /> : <FaRegHeart />}
                      ♥
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const link = document.createElement('a')
                        link.href = image.url
                        link.download = `growfly-${image.id}.png`
                        link.click()
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 rounded-2xl text-xs font-medium transition-all duration-200"
                    >
                      <FaDownload />
                      Save
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(image.id)
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200"
                      title="Share image"
                    >
                      <FaShare className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(image.id)
                      }}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-200"
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
        onPin={handlePin}
        onFavorite={handleFavorite}
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