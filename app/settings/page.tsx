'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ExternalLink, CreditCard, ArrowUpRight, BarChart3, Palette, Play, BookOpen, Sparkles, ChevronDown } from 'lucide-react'
import Link from 'next/link'

// Mock constants for artifact
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'

interface UserProfile {
  name?: string
  email: string
  linkedIn?: string
  jobTitle?: string
  industry?: string
  narrative?: string
  subscriptionType?: string
  stripeCustomerId?: string
  goals?: string
  // ✅ NEW: Usage fields from API
  promptsUsed?: number
  promptLimit?: number
  maxPromptLimit?: number
  imagesGeneratedToday?: number
  imagesGeneratedThisMonth?: number
  dailyImageLimit?: number
  monthlyImageLimit?: number
  lastImageGeneratedDate?: string
  lastImageResetDate?: string
}

// ✅ SIMPLIFIED: Usage interface based on API response
interface UsageData {
  promptsUsed: number
  promptLimit: number
  maxPromptLimit: number
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
  subscriptionName: string
}

const PROMPT_LIMITS: Record<string, number> = {
  free: 20,
  personal: 400,
  business: 2000,
  enterprise: -1, // unlimited
}

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [form, setForm] = useState({
    name: '',
    linkedIn: '',
    jobTitle: '',
    industry: '',
    narrative: '',
    goals: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [usageLoading, setUsageLoading] = useState(true)
  const [usageError, setUsageError] = useState<string | null>(null)
  const [showUsageDetails, setShowUsageDetails] = useState(false) // ✅ NEW: Collapsible state

  useEffect(() => {
    const storedToken = localStorage.getItem('growfly_jwt')
    if (!storedToken) {
      router.push('/login')
    } else {
      setToken(storedToken)
    }
  }, [router])

  useEffect(() => {
    if (!token) return

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await res.json()
        console.log('🔍 User data received from API:', data) // Enhanced debug log
        
        // ✅ ENHANCED: Check what usage fields are actually returned
        console.log('📊 Usage fields check:', {
          promptsUsed: data.promptsUsed,
          promptLimit: data.promptLimit,
          imagesGeneratedToday: data.imagesGeneratedToday,
          imagesGeneratedThisMonth: data.imagesGeneratedThisMonth,
          dailyImageLimit: data.dailyImageLimit,
          monthlyImageLimit: data.monthlyImageLimit,
          subscriptionType: data.subscriptionType
        })
        
        setUser(data)
        setForm({
          name: data.name || '',
          linkedIn: data.linkedIn || '',
          jobTitle: data.jobTitle || '',
          industry: data.industry || '',
          narrative: data.narrative || '',
          goals: data.goals || '',
          password: '',
          confirmPassword: '',
        })

        // ✅ ENHANCED: Better usage data extraction with fallbacks
        if (data) {
          // Define subscription-based limits
          const subscriptionType = (data.subscriptionType || 'free').toLowerCase()
          const subscriptionLimits = {
            free: { prompts: 20, dailyImages: 2, monthlyImages: 10 },
            personal: { prompts: 400, dailyImages: 10, monthlyImages: 100 },
            business: { prompts: 2000, dailyImages: 25, monthlyImages: 300 },
            enterprise: { prompts: -1, dailyImages: -1, monthlyImages: -1 }
          }
          
          const limits = subscriptionLimits[subscriptionType] || subscriptionLimits.free
          
          // Use API data if available, otherwise use test data that makes sense
          const promptsUsed = data.promptsUsed ?? 0
          const promptLimit = data.promptLimit ?? limits.prompts
          const dailyImagesUsed = data.imagesGeneratedToday ?? 0
          const monthlyImagesUsed = data.imagesGeneratedThisMonth ?? 0
          const dailyImageLimit = data.dailyImageLimit ?? limits.dailyImages
          const monthlyImageLimit = data.monthlyImageLimit ?? limits.monthlyImages

          console.log('📈 Calculated usage data:', {
            promptsUsed,
            promptLimit,
            dailyImagesUsed,
            monthlyImagesUsed,
            dailyImageLimit,
            monthlyImageLimit
          })

          setUsageData({
            promptsUsed,
            promptLimit,
            maxPromptLimit: promptLimit,
            dailyImages: {
              used: dailyImagesUsed,
              limit: dailyImageLimit,
              remaining: dailyImageLimit === -1 ? -1 : Math.max(0, dailyImageLimit - dailyImagesUsed)
            },
            monthlyImages: {
              used: monthlyImagesUsed,
              limit: monthlyImageLimit,
              remaining: monthlyImageLimit === -1 ? -1 : Math.max(0, monthlyImageLimit - monthlyImagesUsed)
            },
            subscriptionName: data.subscriptionType || 'Free'
          })
          setUsageLoading(false)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [token, router])

  const getTimeUntilMidnight = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const hours = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60))
    return `${hours} hours`
  }

  const getTimeUntilNextMonth = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const days = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      if (value.length === 0) {
        setPasswordStrength('')
      } else if (value.length < 8) {
        setPasswordStrength('Weak')
      } else if (/\d/.test(value) && /[!@#$%^&*]/.test(value)) {
        setPasswordStrength('Strong')
      } else {
        setPasswordStrength('Moderate')
      }
    }
  }

  const handleSubmit = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match.")
      return
    }

    if (saving) return

    try {
      setSaving(true)
      setSaveSuccess(false)

      const { confirmPassword, ...updateData } = form

      // Only include password if it's being changed
      const body = form.password ? updateData : { ...updateData, password: undefined }

      const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      // Show success feedback
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Clear password fields on successful save
      if (form.password) {
        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
        setPasswordStrength('')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      console.error('Error updating profile:', errorMessage)
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleBillingPortal = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing-portal`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      const data = await res.json()
      
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        alert(data.error || 'Billing portal is only available for paid users. Upgrade your plan to access billing management.')
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error)
      alert('Billing management is only available for paid users. Upgrade your plan to access this feature.')
    }
  }

  // ✅ ENHANCED: Better usage calculation functions
  const getPromptUsagePercentage = () => {
    if (!usageData || usageData.promptLimit === -1) return 0
    return Math.min(100, (usageData.promptsUsed / usageData.promptLimit) * 100)
  }

  const getPromptUsageColor = () => {
    if (!usageData || usageData.promptLimit === -1) return 'from-green-500 to-emerald-600'
    const percentage = getPromptUsagePercentage()
    if (percentage >= 90) return 'from-red-500 to-red-600'
    if (percentage >= 70) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-purple-600'
  }

  const getImageUsagePercentage = () => {
    if (!usageData || !usageData.dailyImages.limit) return 0
    return Math.min(100, (usageData.dailyImages.used / usageData.dailyImages.limit) * 100)
  }

  const getImageUsageColor = () => {
    if (!usageData) return 'from-purple-500 to-blue-500'
    const remaining = usageData.dailyImages.remaining
    if (remaining <= 0) return 'from-red-500 to-red-600'
    if (remaining <= 1) return 'from-orange-500 to-red-500'
    return 'from-purple-500 to-blue-500'
  }

  // ✅ ENHANCED: Better tutorial handler
  const handleStartTutorial = () => {
    console.log('🎯 Starting Growfly tutorial from settings')
    
    try {
      // Multiple approaches to ensure tutorial starts
      const startTutorial = () => {
        // Method 1: Custom event
        window.dispatchEvent(new CustomEvent('startGrowflyTour', { 
          bubbles: true,
          detail: { 
            source: 'settings', 
            force: true, 
            timestamp: Date.now() 
          }
        }))

        // Method 2: Global function call
        if (typeof (window as any).startGrowflyTour === 'function') {
          (window as any).startGrowflyTour({ source: 'settings', force: true })
        }

        // Method 3: Tour library direct call
        if (typeof (window as any).driver !== 'undefined') {
          (window as any).driver.drive()
        }
      }

      // Try immediate start
      startTutorial()

      // Set localStorage flags
      localStorage.setItem('force-tutorial-start', 'true')
      localStorage.removeItem('growfly-tutorial-completed')
      sessionStorage.setItem('tutorial-source', 'settings')

      // Navigate to dashboard with tutorial parameter
      setTimeout(() => {
        if (window.location.pathname.includes('/dashboard')) {
          // Already on dashboard, try to trigger again
          startTutorial()
          window.location.reload()
        } else {
          // Navigate to dashboard
          router.push('/dashboard?tutorial=start&source=settings')
        }
      }, 100)

    } catch (error) {
      console.error('Error starting tutorial:', error)
      // Fallback navigation
      router.push('/dashboard?tutorial=start&source=settings')
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-slate-300 text-sm">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        
        {/* ✅ FIXED: Header without back button */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your profile and account preferences</p>
        </div>

        <div className="space-y-6">
          
          {/* ✅ ENHANCED: Improved Tutorial Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Getting Started</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Master Growfly with our interactive tour</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-700/20 dark:to-pink-700/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 dark:from-blue-700/20 dark:to-purple-700/20 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">Take the Growfly Tour</h3>
                    </div>
                    
                    <p className="text-purple-700 dark:text-purple-300 mb-4 leading-relaxed text-sm">
                      Discover powerful features designed specifically for your business growth. 
                      Our interactive tour shows you exactly how to maximize your results with Growfly.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                        <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">🚀</span>
                        </div>
                        <span>Interactive walkthrough</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                        <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">⏱️</span>
                        </div>
                        <span>Just 2-3 minutes</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                        <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">💡</span>
                        </div>
                        <span>Pro tips included</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleStartTutorial}
                        className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                      >
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Start Interactive Tour
                        <Sparkles className="w-3 h-3 opacity-75" />
                      </button>
                      
                      <Link
                        href="/dashboard"
                        className="group bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-700 px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                      >
                        Skip to Dashboard
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Tutorial completion status */}
                {localStorage.getItem('growfly-tutorial-completed') === 'true' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Tour Completed!</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Great job! You can retake the tour anytime to refresh your knowledge.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ ENHANCED: Development debug section */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <h4 className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🔧 Tutorial Debug (Development)</h4>
                <div className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 mb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>Tutorial completed: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded text-xs">{localStorage.getItem('growfly-tutorial-completed') || 'false'}</code></div>
                    <div>Onboarding flag: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded text-xs">{sessionStorage.getItem('justCompletedOnboarding') || 'false'}</code></div>
                    <div>Force tutorial: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded text-xs">{localStorage.getItem('force-tutorial-start') || 'false'}</code></div>
                    <div>Tutorial source: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded text-xs">{sessionStorage.getItem('tutorial-source') || 'none'}</code></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('growfly-tutorial-completed')
                      sessionStorage.setItem('justCompletedOnboarding', 'true')
                      localStorage.removeItem('force-tutorial-start')
                      alert('Flags reset! Navigate to dashboard to test new user flow.')
                    }}
                    className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-lg hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                  >
                    Reset as New User
                  </button>
                  <button
                    onClick={() => {
                      console.log('🎯 Testing force tutorial event')
                      window.dispatchEvent(new CustomEvent('startGrowflyTour', { detail: { force: true, source: 'debug' } }))
                    }}
                    className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-lg hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors"
                  >
                    Test Event Trigger
                  </button>
                  <button
                    onClick={() => router.push('/dashboard?tutorial=start&debug=true')}
                    className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
                  >
                    Direct Navigation
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('growfly-tutorial-completed', 'true')
                      alert('Tutorial marked as completed')
                      window.location.reload()
                    }}
                    className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg hover:bg-green-300 dark:hover:bg-green-700 transition-colors"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Account Information */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Email Address
                </label>
                <input 
                  type="email" 
                  disabled 
                  value={user.email} 
                  className="w-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl p-4 border border-gray-200 dark:border-slate-600 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
              </div>

              {/* Subscription Plan */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Current Plan
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    disabled 
                    value={user.subscriptionType || 'Free'} 
                    className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl p-4 border border-gray-200 dark:border-slate-600 cursor-not-allowed capitalize text-sm"
                  />
                  <Link 
                    href="/change-plan"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Upgrade <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Full Name
                </label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  LinkedIn Profile
                </label>
                <input 
                  name="linkedIn" 
                  value={form.linkedIn} 
                  onChange={handleChange} 
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 Adding your LinkedIn helps us provide better networking suggestions
                </p>
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Job Title
                </label>
                <input 
                  name="jobTitle" 
                  value={form.jobTitle} 
                  onChange={handleChange} 
                  placeholder="e.g. Marketing Manager"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Industry
                </label>
                <input 
                  name="industry" 
                  value={form.industry} 
                  onChange={handleChange} 
                  placeholder="e.g. Technology, Healthcare, Finance"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* About You */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  About You
                </label>
                <textarea 
                  name="narrative" 
                  rows={4} 
                  value={form.narrative} 
                  onChange={handleChange} 
                  placeholder="Tell us about yourself, your background, and what you do..."
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Goals */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  What do you aim to get from using Growfly?
                </label>
                <textarea
                  name="goals"
                  rows={4}
                  placeholder="This helps us tailor your experience and provide better recommendations..."
                  value={form.goals}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  New Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
                {form.password && (
                  <p className={`text-xs font-medium ${
                    passwordStrength === 'Strong' ? 'text-green-600 dark:text-green-400' :
                    passwordStrength === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    Password strength: {passwordStrength}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                saveSuccess 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-200 dark:shadow-emerald-900/30' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-200 dark:shadow-blue-900/30'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Changes...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Changes Saved!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBillingPortal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-gray-800 dark:from-gray-700 dark:to-slate-600 hover:from-slate-800 hover:to-gray-900 dark:hover:from-gray-600 dark:hover:to-slate-500 text-white px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <CreditCard className="h-5 w-5" />
              Manage Billing & Invoices
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-base">Your settings have been updated successfully!</span>
              </div>
            </div>
          )}

          {/* ✅ ENHANCED: Small collapsible usage section with better design */}
          {usageData && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-gray-200 dark:border-slate-600 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowUsageDetails(!showUsageDetails)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 dark:hover:from-slate-700/70 dark:hover:to-slate-600/70 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Usage Overview</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {usageData.promptLimit === -1 ? 'Unlimited' : `${usageData.promptsUsed}/${usageData.promptLimit}`} prompts • 
                      {usageData.dailyImages.limit === -1 ? ' Unlimited' : ` ${usageData.dailyImages.remaining}/${usageData.dailyImages.limit}`} images today
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {user.subscriptionType || 'Free'} Plan
                    </div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {showUsageDetails ? 'Hide Details' : 'View Details'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUsageDetails ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showUsageDetails && (
                <div className="px-4 pb-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Enhanced Prompt Usage Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">💬</span>
                          </div>
                          <span className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Chat Prompts</span>
                        </div>
                        <span className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                          {usageData.promptsUsed}/{usageData.promptLimit === -1 ? '∞' : usageData.promptLimit}
                        </span>
                      </div>
                      
                      {usageData.promptLimit !== -1 ? (
                        <>
                          <div className="relative w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getPromptUsageColor()} rounded-full transition-all duration-500 ease-out shadow-sm`}
                              style={{ width: `${Math.min(getPromptUsagePercentage(), 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                            <span>{usageData.promptLimit - usageData.promptsUsed} remaining</span>
                            <span>{getPromptUsagePercentage().toFixed(1)}% used</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                          <Sparkles className="w-3 h-3" />
                          Unlimited prompts available
                        </div>
                      )}
                    </div>

                    {/* Enhanced Image Usage Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Palette className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-semibold text-purple-800 dark:text-purple-300 text-sm">Images Today</span>
                        </div>
                        <span className="font-bold text-purple-900 dark:text-purple-200 text-sm">
                          {usageData.dailyImages.remaining}/{usageData.dailyImages.limit === -1 ? '∞' : usageData.dailyImages.limit}
                        </span>
                      </div>
                      
                      {usageData.dailyImages.limit !== -1 ? (
                        <>
                          <div className="relative w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden mb-2">
                            <div 
                              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getImageUsageColor()} rounded-full transition-all duration-500 ease-out shadow-sm`}
                              style={{ width: `${Math.min(getImageUsagePercentage(), 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-purple-700 dark:text-purple-300">
                            <span>{usageData.dailyImages.used} used today</span>
                            <span>Resets in {getTimeUntilMidnight()}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                          <Sparkles className="w-3 h-3" />
                          Unlimited images available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced upgrade prompt */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">Need more capacity?</h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">Upgrade for higher limits and unlimited access.</p>
                        </div>
                      </div>
                      <Link 
                        href="/change-plan"
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Upgrade Plan
                      </Link>
                    </div>
                  </div>

                  {/* ✅ DEBUGGING: Show API response in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                      <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-2">🔍 API Debug Info</h4>
                      <div className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                        <div><strong>API Endpoint:</strong> /api/user/settings</div>
                        <div><strong>promptsUsed from API:</strong> {user.promptsUsed ?? 'undefined'}</div>
                        <div><strong>promptLimit from API:</strong> {user.promptLimit ?? 'undefined'}</div>
                        <div><strong>imagesGeneratedToday:</strong> {user.imagesGeneratedToday ?? 'undefined'}</div>
                        <div><strong>subscriptionType:</strong> {user.subscriptionType ?? 'undefined'}</div>
                        <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">
                          <strong>Issue:</strong> If values show 'undefined', your API isn't returning usage fields from the database.
                          <br />
                          <strong>Fix:</strong> Update your /api/user/settings endpoint to include: promptsUsed, promptLimit, imagesGeneratedToday, etc.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}