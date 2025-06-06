// File: components/ImageGeneration/ImageGallery.tsx
// Simple modal version that shows recent images and links to full gallery

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HiX } from 'react-icons/hi'
import { FaImages, FaSpinner, FaDownload, FaTrash, FaExpand } from 'react-icons/fa'

interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  revisedPrompt: string
  size: string
  style: string
  createdAt: string
}

interface ImageGalleryProps {
  open: boolean
  onClose: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

const ImageGallery: React.FC<ImageGalleryProps> = ({ open, onClose }) => {
  const router = useRouter()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  useEffect(() => {
    if (open && token) {
      setLoading(true)
      fetch(`${API_BASE_URL}/api/dalle/gallery?limit=12`, {  // ✅ Updated endpoint
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          // ✅ Updated to match API response structure
          const galleryImages = data.images?.map((img: any) => ({
            id: img.id,
            url: img.imageUrl,
            originalPrompt: img.prompt,
            revisedPrompt: img.prompt,
            size: img.size,
            style: img.style || 'vivid',
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

  const handleViewFullGallery = () => {
    onClose()
    router.push('/gallery')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ✅ Enhanced Header with Full Gallery Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaImages className="text-blue-500" />
              Recent Images
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleViewFullGallery}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FaExpand />
                Full Gallery
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <FaImages className="text-gray-400 text-6xl mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No images generated yet</p>
              <button
                onClick={handleViewFullGallery}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Gallery
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.slice(0, 9).map((image) => (  // ✅ Limit to 9 for modal
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
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                        <span>{image.size}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadImage(image)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <FaDownload className="w-3 h-3" />
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center justify-center"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Show More Button if there are more images */}
              {images.length > 9 && (
                <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Showing 9 of {images.length} images
                  </p>
                  <button
                    onClick={handleViewFullGallery}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <FaExpand />
                    View All Images in Full Gallery
                  </button>
                </div>
              )}
            </>
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
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
                    <div><strong>Size:</strong> {selectedImage.size} | <strong>Style:</strong> {selectedImage.style}</div>
                    <div><strong>Created:</strong> {new Date(selectedImage.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleDownloadImage(selectedImage)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaDownload />
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteImage(selectedImage.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaTrash />
                      Delete
                    </button>
                    <button
                      onClick={handleViewFullGallery}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaExpand />
                      Full Gallery
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

export default ImageGallery