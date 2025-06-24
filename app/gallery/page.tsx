'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Download, 
  Share2, 
  Clock, 
  AlertTriangle, 
  X, 
  Eye,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Heart,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa'

// Use environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

interface GeneratedImage {
  id: string
  url: string
  originalPrompt: string
  revisedPrompt: string
  size: string
  style: string
  createdAt: string
  userId: string
  expiresAt?: string
  isFavorite?: boolean
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  total: number
}

type SortOption = 'newest' | 'oldest' | 'favorites' | 'prompt'

// Utility functions
const calculateTimeRemaining = (expiresAt: string): TimeRemaining => {
  const now = new Date().getTime()
  const expiry = new Date(expiresAt).getTime()
  const difference = expiry - now

  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  }
}

// Updated urgency levels to include 7-day warning
const getUrgencyLevel = (timeRemaining: TimeRemaining): 'safe' | 'week' | 'warning' | 'urgent' | 'critical' => {
  const { total } = timeRemaining
  const hours = total / (1000 * 60 * 60)
  const days = total / (1000 * 60 * 60 * 24)
  
  if (days > 7) return 'safe'        // More than 7 days - no warning
  if (days > 1) return 'week'        // 7 days to 24 hours - yellow warning  
  if (hours > 3) return 'warning'    // 24 hours to 3 hours - orange warning
  if (hours > 1) return 'urgent'     // 3 hours to 1 hour - red warning
  return 'critical'                  // Less than 1 hour - critical red
}

// Enhanced time formatting with urgency messages
const formatTimeRemaining = (timeRemaining: TimeRemaining): string => {
  const { days, hours, minutes, total } = timeRemaining
  
  if (total <= 0) return 'Expired'
  
  if (days > 7) return `${days} days remaining`
  if (days > 1) return `${days}d ${hours}h remaining - Download soon!`
  if (hours > 3) return `${hours}h ${minutes}m remaining - Download now!`
  if (hours > 1) return `${hours}h ${minutes}m remaining - URGENT: Download immediately!`
  return `${minutes}m remaining - CRITICAL: Expires very soon!`
}

const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback - open in new tab
    window.open(url, '_blank')
  }
}

// Enhanced social sharing functions with rich content

// Enhanced Twitter sharing with better content and hashtags
const shareToTwitter = (imageUrl: string, prompt: string, style: string, customHashtags?: string[]) => {
  const defaultHashtags = ['#AIArt', '#GeneratedWithGrowfly', '#AICreativity', '#DigitalArt', `#${style.replace(/\s+/g, '')}`]
  const hashtags = customHashtags || defaultHashtags
  const hashtagString = hashtags.join(' ')
  
  const text = `🎨 Just created this amazing AI artwork: "${prompt}" 

${hashtagString}

✨ Create your own at Growfly AI!`
  
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`
  window.open(url, '_blank', 'width=550,height=420')
}

// Enhanced Facebook sharing with rich content
const shareToFacebook = (imageUrl: string, prompt: string, style: string) => {
  const text = `🎨 Check out this AI-generated masterpiece I just created!

Prompt: "${prompt}"
Style: ${style}

The future of creativity is here! 🚀

#AIArt #CreativeAI #GrowflyAI`
  
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'width=550,height=420')
}

// Enhanced LinkedIn sharing with professional tone
const shareToLinkedIn = (imageUrl: string, prompt: string, style: string, location?: string) => {
  const locationText = location ? ` 📍 ${location}` : ''
  const text = `🚀 Exploring the future of AI creativity with this generated artwork:

"${prompt}"

Style: ${style}

🎯 The possibilities of AI-powered design continue to amaze me. The intersection of technology and creativity is opening up incredible new opportunities for content creation and visual storytelling.

What creative AI projects are you working on?

#AI #CreativeAI #Innovation #Technology #DigitalTransformation #ArtificialIntelligence #GrowflyAI${locationText}`
  
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}&summary=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'width=550,height=420')
}

// Enhanced Instagram sharing with rich caption and instructions
const shareToInstagram = async (imageUrl: string, prompt: string, style: string, customHashtags?: string[]) => {
  const defaultHashtags = [
    '#AIArt', '#GeneratedWithGrowfly', '#AICreativity', '#DigitalArt', 
    '#ArtificialIntelligence', '#CreativeAI', '#TechArt', '#Innovation',
    `#${style.replace(/\s+/g, '')}`, '#FutureOfArt'
  ]
  const hashtags = customHashtags || defaultHashtags
  const hashtagString = hashtags.join(' ')
  
  const caption = `🎨✨ AI-Generated Masterpiece ✨🎨

"${prompt}"

Created with @growfly.ai using ${style} style! 

The future of creativity is here and it's absolutely mind-blowing! 🤯

${hashtagString}

👆 Link in bio to create your own AI art!`

  try {
    await navigator.clipboard.writeText(caption)
    alert(`🎨 Instagram caption copied to clipboard!

📱 To share on Instagram:
1. Save this image to your device (long press on mobile)
2. Open Instagram app
3. Create a new post
4. Select the saved image
5. Paste the copied caption
6. Add location if desired
7. Post and watch the magic happen! ✨

Caption includes optimized hashtags and call-to-action!`)
  } catch (error) {
    const fallbackText = `Caption for Instagram:\n\n${caption}\n\nPlease copy this text manually.`
    alert(fallbackText)
  }
}

// Get user's location for enhanced sharing (optional)
const getUserLocation = async (): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Using a simple reverse geocoding service (you might want to use Google Maps API)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          )
          const data = await response.json()
          resolve(data.city ? `${data.city}, ${data.countryName}` : undefined)
        } catch {
          resolve(undefined)
        }
      },
      () => resolve(undefined),
      { timeout: 5000 }
    )
  })
}

// Image Card Component
const ImageCard: React.FC<{ 
  image: GeneratedImage; 
  onDelete: (id: string) => void;
  onView: (image: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
}> = ({ image, onDelete, onView, onToggleFavorite }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!image.expiresAt) return

    const updateTimer = () => {
      const remaining = calculateTimeRemaining(image.expiresAt!)
      setTimeRemaining(remaining)
      
      if (remaining.total <= 0) {
        onDelete(image.id)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [image.expiresAt, image.id, onDelete])

  // Get user location once for enhanced sharing
  useEffect(() => {
    getUserLocation().then(setUserLocation)
  }, [])

  const urgencyLevel = timeRemaining ? getUrgencyLevel(timeRemaining) : 'safe'
  
  // Updated urgency styles with new 'week' level and enhanced critical state
  const urgencyStyles = {
    safe: 'bg-green-50 text-green-700 border-green-200',
    week: 'bg-yellow-50 text-yellow-600 border-yellow-200',      // New 7-day warning
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    urgent: 'bg-red-50 text-red-700 border-red-200',
    critical: 'bg-red-100 text-red-800 border-red-300 animate-pulse' // More dramatic for final hour
  }

  const copyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(image.url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Enhanced warning icon based on urgency
  const getWarningIcon = () => {
    switch(urgencyLevel) {
      case 'week': return <Clock className="w-3 h-3" />
      case 'warning': return <AlertTriangle className="w-3 h-3" />
      case 'urgent': return <AlertTriangle className="w-3 h-3" />
      case 'critical': return <AlertTriangle className="w-3 h-3 animate-bounce" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={image.url}
          alt={image.originalPrompt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => console.error('Image failed to load:', image.url)}
        />
        
        {/* Favorite button - top right */}
        <button
          onClick={() => onToggleFavorite(image.id)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200 shadow-md"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              image.isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </button>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <button
            onClick={() => onView(image)}
            className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Prompt */}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {image.originalPrompt}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {image.size} • {image.style} • {new Date(image.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Enhanced time remaining warning */}
        {timeRemaining && timeRemaining.total > 0 && urgencyLevel !== 'safe' && (
          <div className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 ${urgencyStyles[urgencyLevel]}`}>
            {getWarningIcon()}
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}

        {/* Action buttons - improved visibility */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Download */}
            <button
              onClick={() => downloadImage(image.url, `growfly-${image.id}.png`)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Copy URL */}
            <button
              onClick={copyImageUrl}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(image.id)}
              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 rounded-lg transition-colors text-red-600 dark:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced social sharing - improved visibility */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => shareToTwitter(image.url, image.originalPrompt, image.style)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-500"
              title="Share to X (Twitter)"
            >
              <FaTwitter className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => shareToFacebook(image.url, image.originalPrompt, image.style)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600"
              title="Share to Facebook"
            >
              <FaFacebook className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => shareToLinkedIn(image.url, image.originalPrompt, image.style, userLocation)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-700"
              title="Share to LinkedIn"
            >
              <FaLinkedin className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => shareToInstagram(image.url, image.originalPrompt, image.style)}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-pink-500"
              title="Share to Instagram"
            >
              <FaInstagram className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Image Modal Component
const ImageModal: React.FC<{
  image: GeneratedImage | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}> = ({ image, onClose, onToggleFavorite }) => {
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined)

  useEffect(() => {
    getUserLocation().then(setUserLocation)
  }, [])

  if (!image) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-2/3">
            <Image
              src={image.url}
              alt={image.originalPrompt}
              width={800}
              height={800}
              className="w-full h-auto object-contain"
            />
          </div>
          
          <div className="md:w-1/3 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Details</h3>
              <button
                onClick={() => onToggleFavorite(image.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    image.isFavorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  }`} 
                />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt:</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{image.originalPrompt}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{image.size}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Style:</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{image.style}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(image.createdAt).toLocaleDateString()} at {new Date(image.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <button
                onClick={() => downloadImage(image.url, `growfly-${image.id}.png`)}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => shareToTwitter(image.url, image.originalPrompt, image.style)}
                  className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaTwitter className="w-3 h-3" />
                  X/Twitter
                </button>
                
                <button
                  onClick={() => shareToLinkedIn(image.url, image.originalPrompt, image.style, userLocation)}
                  className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaLinkedin className="w-3 h-3" />
                  LinkedIn
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => shareToFacebook(image.url, image.originalPrompt, image.style)}
                  className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaFacebook className="w-3 h-3" />
                  Facebook
                </button>
                
                <button
                  onClick={() => shareToInstagram(image.url, image.originalPrompt, image.style)}
                  className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaInstagram className="w-3 h-3" />
                  Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Gallery Component
export default function GalleryPage() {
  const router = useRouter()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // New state for search and filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  const fetchImages = useCallback(async () => {
    if (!token) {
      router.push('/onboarding')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dalle/gallery`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      
      // Add expiration dates and favorite status
      const imagesWithExpiry = data.images.map((img: GeneratedImage) => ({
        ...img,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        isFavorite: false // You might want to fetch this from your backend
      }))
      
      setImages(imagesWithExpiry)
    } catch (error) {
      console.error('Error fetching images:', error)
      setError('Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleDeleteImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  const handleViewImage = useCallback((image: GeneratedImage) => {
    setSelectedImage(image)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const handleToggleFavorite = useCallback((imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isFavorite: !img.isFavorite }
        : img
    ))
  }, [])

  // Filter and sort images
  const filteredAndSortedImages = React.useMemo(() => {
    let filtered = images

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(image =>
        image.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.style.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(image => image.isFavorite)
    }

    // Sort images
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'favorites':
          if (a.isFavorite && !b.isFavorite) return -1
          if (!a.isFavorite && b.isFavorite) return 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'prompt':
          return a.originalPrompt.localeCompare(b.originalPrompt)
        default:
          return 0
      }
    })

    return sorted
  }, [images, searchQuery, sortBy, showFavoritesOnly])

  const favoriteCount = images.filter(img => img.isFavorite).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your gallery...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchImages}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your AI Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {images.length} {images.length === 1 ? 'image' : 'images'} created
            {favoriteCount > 0 && (
              <span className="text-red-500 ml-2">• {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by prompt or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">
                {showFavoritesOnly ? 'Show All' : 'Favorites'}
              </span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="favorites">Favorites First</option>
              <option value="prompt">By Prompt (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || showFavoritesOnly) && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedImages.length} of {images.length} images
              {searchQuery && (
                <span> matching "{searchQuery}"</span>
              )}
              {showFavoritesOnly && (
                <span> (favorites only)</span>
              )}
            </p>
          </div>
        )}

        {/* Images Grid */}
        {filteredAndSortedImages.length === 0 ? (
          <div className="text-center py-12">
            {images.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No images yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start creating amazing AI artwork!</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Image
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {showFavoritesOnly 
                    ? "You haven't favorited any images yet" 
                    : "Try adjusting your search terms"}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowFavoritesOnly(false)
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={handleDeleteImage}
                onView={handleViewImage}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal 
        image={selectedImage} 
        onClose={handleCloseModal}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  )
}