// File: components/ImageGeneration/ImageGallery.tsx
// This component was likely created but has a syntax error

import React, { useState, useEffect } from 'react'
import { HiX } from 'react-icons/hi'
import { FaImages, FaSpinner, FaDownload, FaTrash } from 'react-icons/fa'

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

interface ImageGalleryProps {
  open: boolean
  onClose: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

const ImageGallery: React.FC<ImageGalleryProps> = ({ open, onClose }) => {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  useEffect(() => {
    if (open && token) {
      setLoading(true)
      fetch(`${API_BASE_URL}/api/dalle/images?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setImages(data.images || [])
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