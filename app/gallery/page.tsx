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
  SortDesc,
  Info,
  Edit3,
  Save
} from 'lucide-react'
import { FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

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
  customName?: string
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

// Enhanced X (Twitter) sharing with better content and hashtags
const shareToTwitter = (imageUrl: string, prompt: string, style: string, customHashtags?: string[]) => {
  try {
    // Ensure all parameters are strings and handle undefined/null values
    const safePrompt = prompt || 'AI Generated Art'
    const safeStyle = style || 'Digital'
    const safeImageUrl = imageUrl || ''
    
    if (!safeImageUrl) {
      alert('Unable to share: Image URL not available')
      return
    }
    
    const styleTag = safeStyle ? `#${safeStyle.replace(/\s+/g, '')}` : '#DigitalArt'
    const defaultHashtags = ['#AIArt', '#GeneratedWithGrowfly.io', '#AICreativity', '#DigitalArt', styleTag]
    const hashtags = customHashtags || defaultHashtags
    const hashtagString = hashtags.join(' ')
    
    const text = `🎨 Just created this amazing AI artwork: "${safePrompt}" 

${hashtagString}

✨ Create your own at Growfly AI!`
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(safeImageUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  } catch (error) {
    console.error('Error sharing to X/Twitter:', error)
    alert('Unable to share to X/Twitter. Please try again.')
  }
}

// Enhanced Facebook sharing with rich content
const shareToFacebook = (imageUrl: string, prompt: string, style: string) => {
  try {
    // Ensure all parameters are strings and handle undefined/null values
    const safePrompt = prompt || 'AI Generated Art'
    const safeStyle = style || 'Digital'
    const safeImageUrl = imageUrl || ''
    
    if (!safeImageUrl) {
      alert('Unable to share: Image URL not available')
      return
    }
    
    const text = `🎨 Check out this AI-generated masterpiece I just created with growfly.io!

Prompt: "${safePrompt}"
Style: ${safeStyle}

The future of creativity is here! 🚀

#AIArt #CreativeAI #GrowflyAI`
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(safeImageUrl)}&quote=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=550,height=420')
  } catch (error) {
    console.error('Error sharing to Facebook:', error)
    alert('Unable to share to Facebook. Please try again.')
  }
}

// Enhanced LinkedIn sharing with professional tone
const shareToLinkedIn = (imageUrl: string, prompt: string, style: string, location?: string) => {
  try {
    // Ensure all parameters are strings and handle undefined/null values
    const safePrompt = prompt || 'AI Generated Art'
    const safeStyle = style || 'Digital'
    const safeImageUrl = imageUrl || ''
    
    if (!safeImageUrl) {
      alert('Unable to share: Image URL not available')
      return
    }
    
    const locationText = location ? ` 📍 ${location}` : ''
    const text = `🚀 Exploring the future of AI creativity with this generated artwork:

"${safePrompt}"

Style: ${safeStyle}

🎯 The possibilities of AI-powered design continue to amaze me. The intersection of technology and creativity is opening up incredible new opportunities for content creation and visual storytelling.

What creative AI projects are you working on?

#AI #CreativeAI #Innovation #Technology #DigitalTransformation #ArtificialIntelligence #GrowflyAI${locationText}`
    
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(safeImageUrl)}&summary=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=550,height=420')
  } catch (error) {
    console.error('Error sharing to LinkedIn:', error)
    alert('Unable to share to LinkedIn. Please try again.')
  }
}

// Enhanced Instagram sharing with rich caption and instructions
const shareToInstagram = async (imageUrl: string, prompt: string, style: string, customHashtags?: string[]) => {
  try {
    // Ensure all parameters are strings and handle undefined/null values
    const safePrompt = prompt || 'AI Generated Art'
    const safeStyle = style || 'Digital'
    const safeImageUrl = imageUrl || ''
    
    if (!safeImageUrl) {
      alert('Unable to share: Image URL not available')
      return
    }
    
    const styleTag = safeStyle ? `#${safeStyle.replace(/\s+/g, '')}` : '#DigitalArt'
    const defaultHashtags = [
      '#AIArt', '#GeneratedWithGrowfly', '#AICreativity', '#DigitalArt', 
      '#ArtificialIntelligence', '#CreativeAI', '#TechArt', '#Innovation',
      styleTag, '#FutureOfArt'
    ]
    const hashtags = customHashtags || defaultHashtags
    const hashtagString = hashtags.join(' ')
    
    const caption = `🎨✨ AI-Generated Masterpiece ✨🎨

"${safePrompt}"

Created with @growfly.ai using ${safeStyle} style! 

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
    } catch (clipboardError) {
      const fallbackText = `Caption for Instagram:\n\n${caption}\n\nPlease copy this text manually.`
      alert(fallbackText)
    }
  } catch (error) {
    console.error('Error sharing to Instagram:', error)
    alert('Unable to prepare Instagram share. Please try again.')
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
  onRename: (id: string, newName: string) => void;
}> = ({ image, onDelete, onView, onToggleFavorite, onRename }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(image.customName || image.originalPrompt)

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

  const handleSaveRename = () => {
    if (editName.trim() && editName !== (image.customName || image.originalPrompt)) {
      onRename(image.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      setEditName(image.customName || image.originalPrompt)
      setIsEditing(false)
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

  const displayName = image.customName || image.originalPrompt

  return (
    <div className="bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700/50 rounded-xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm">
      {/* Image */}
      <div className="relative aspect-square">
        {image.url ? (
          <Image
            src={image.url}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error('Image failed to load:', image.url)
              // Hide the broken image
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Image not available</span>
          </div>
        )}
        
        {/* Favorite button - top right */}
        <button
          onClick={() => onToggleFavorite(image.id)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-lg transition-all duration-200 shadow-md hover:scale-110"
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
            className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Image Name/Prompt - Editable */}
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveRename}
                className="flex-1 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-blue-500 focus:outline-none"
                autoFocus
                maxLength={100}
              />
              <button
                onClick={handleSaveRename}
                className="p-1 text-green-600 hover:text-green-700 transition-colors"
              >
                <Save className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <p 
                className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
                onClick={() => setIsEditing(true)}
                title="Click to rename"
              >
                {displayName}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors ml-2"
                title="Rename image"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">{image.size}</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">{image.style}</span>
            <span>{new Date(image.createdAt).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Enhanced time remaining warning */}
        {timeRemaining && timeRemaining.total > 0 && urgencyLevel !== 'safe' && (
          <div className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 ${urgencyStyles[urgencyLevel]}`}>
            {getWarningIcon()}
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}

        {/* Action buttons - improved visibility */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Download */}
            <button
              onClick={() => downloadImage(image.url, `${displayName.slice(0, 30)}-growfly.png`)}
              className="p-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 rounded-xl transition-all duration-200 text-blue-600 dark:text-blue-400 hover:scale-110 shadow-sm"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Copy URL */}
            <button
              onClick={copyImageUrl}
              className="p-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:scale-110 shadow-sm"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(image.id)}
              className="p-2.5 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 dark:from-red-900/30 dark:to-pink-900/30 dark:hover:from-red-800/40 dark:hover:to-pink-800/40 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:scale-110 shadow-sm"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced social sharing - improved visibility */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => shareToTwitter(image.url, displayName, image.style)}
              className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 dark:from-gray-700 dark:to-gray-600 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:scale-105 shadow-sm"
              title="Share to X (Twitter)"
            >
              <FaXTwitter className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => shareToFacebook(image.url, displayName, image.style)}
              className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 dark:from-gray-700 dark:to-gray-600 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:scale-105 shadow-sm"
              title="Share to Facebook"
            >
              <FaFacebook className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => shareToLinkedIn(image.url, displayName, image.style, userLocation)}
              className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 dark:from-gray-700 dark:to-gray-600 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-700 hover:scale-105 shadow-sm"
              title="Share to LinkedIn"
            >
              <FaLinkedin className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => shareToInstagram(image.url, displayName, image.style)}
              className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-pink-100 hover:to-purple-100 dark:from-gray-700 dark:to-gray-600 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-pink-500 hover:scale-105 shadow-sm"
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

  const displayName = image.customName || image.originalPrompt

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-5xl max-h-[90vh] bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col lg:flex-row">
          <div className="relative lg:w-2/3">
            {image.url ? (
              <Image
                src={image.url}
                alt={displayName}
                width={800}
                height={800}
                className="w-full h-auto object-contain rounded-l-2xl"
                onError={(e) => {
                  console.error('Modal image failed to load:', image.url)
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-l-2xl">
                <span className="text-gray-400">Image not available</span>
              </div>
            )}
          </div>
          
          <div className="lg:w-1/3 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Image Details</h3>
              <button
                onClick={() => onToggleFavorite(image.id)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    image.isFavorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  }`} 
                />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Prompt:</label>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{displayName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Size:</label>
                  <p className="text-gray-600 dark:text-gray-400">{image.size}</p>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Style:</label>
                  <p className="text-gray-600 dark:text-gray-400">{image.style}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Created:</label>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(image.createdAt).toLocaleDateString()} at {new Date(image.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <button
                onClick={() => downloadImage(image.url, `${displayName.slice(0, 30)}-growfly.png`)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Download Image
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareToTwitter(image.url, displayName, image.style)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-3 px-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FaXTwitter className="w-4 h-4" />
                  X/Twitter
                </button>
                
                <button
                  onClick={() => shareToLinkedIn(image.url, displayName, image.style, userLocation)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-3 px-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FaLinkedin className="w-4 h-4" />
                  LinkedIn
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareToFacebook(image.url, displayName, image.style)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-3 px-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FaFacebook className="w-4 h-4" />
                  Facebook
                </button>
                
                <button
                  onClick={() => shareToInstagram(image.url, displayName, image.style)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-3 px-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FaInstagram className="w-4 h-4" />
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
      
      // Add expiration dates and favorite status (30 days from creation)
      const imagesWithExpiry = data.images.map((img: GeneratedImage) => ({
        ...img,
        expiresAt: new Date(new Date(img.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from creation
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
    // TODO: Sync with backend
  }, [])

  const handleRename = useCallback((imageId: string, newName: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, customName: newName }
        : img
    ))
    // TODO: Sync with backend
  }, [])

  // Filter and sort images
  const filteredAndSortedImages = React.useMemo(() => {
    let filtered = images

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(image => {
        const searchTerm = searchQuery.toLowerCase()
        const displayName = (image.customName || image.originalPrompt).toLowerCase()
        return displayName.includes(searchTerm) || 
               image.style.toLowerCase().includes(searchTerm)
      })
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
          const aName = a.customName || a.originalPrompt
          const bName = b.customName || b.originalPrompt
          return aName.localeCompare(bName)
        default:
          return 0
      }
    })

    return sorted
  }, [images, searchQuery, sortBy, showFavoritesOnly])

  const favoriteCount = images.filter(img => img.isFavorite).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Loading your gallery...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={fetchImages}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">Your AI Gallery</h1>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            All your Growfly-generated images are automatically saved here. Images are stored for 30 days before being permanently deleted to save space.
            {favoriteCount > 0 && (
              <span className="text-red-500 ml-2 font-medium">• {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''}</span>
            )}
          </p>
          
          {/* Enhanced Info Banner */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6 flex items-start gap-4 max-w-3xl mx-auto shadow-lg backdrop-blur-sm">
            <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <p className="text-blue-900 dark:text-blue-100 font-bold text-lg mb-2">
                Auto-deletion in 30 days
              </p>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                Download your favorites to keep them permanently. You'll see warnings as the deletion date approaches.
                Click on any image name to rename it with a custom title.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by prompt or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg backdrop-blur-sm transition-all duration-200"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                showFavoritesOnly
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span>
                {showFavoritesOnly ? 'Show All' : 'Favorites'}
              </span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-6 py-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg backdrop-blur-sm font-semibold min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="favorites">Favorites First</option>
              <option value="prompt">By Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || showFavoritesOnly) && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredAndSortedImages.length}</span> of <span className="font-bold">{images.length}</span> images
              {searchQuery && (
                <span> matching "<span className="font-semibold text-indigo-600 dark:text-indigo-400">{searchQuery}</span>"</span>
              )}
              {showFavoritesOnly && (
                <span className="text-red-500 font-semibold"> (favorites only)</span>
              )}
            </p>
          </div>
        )}

        {/* Images Grid */}
        {filteredAndSortedImages.length === 0 ? (
          <div className="text-center py-20">
            {images.length === 0 ? (
              <>
                <div className="text-8xl mb-6">🎨</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No images yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">Start creating amazing AI artwork!</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
                >
                  Create Your First Image
                </button>
              </>
            ) : (
              <>
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No images found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  {showFavoritesOnly 
                    ? "You haven't favorited any images yet" 
                    : "Try adjusting your search terms"}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowFavoritesOnly(false)
                  }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={handleDeleteImage}
                onView={handleViewImage}
                onToggleFavorite={handleToggleFavorite}
                onRename={handleRename}
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