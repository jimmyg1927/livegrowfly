'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ExternalLink, CreditCard, ArrowUpRight, BarChart3, Palette } from 'lucide-react'
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
  promptsUsed?: number
}

// ✅ NEW: Usage interface for tracking
interface UsageData {
  promptsUsed: number
  promptLimit: number
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
}

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null) // ✅ NEW: Usage state
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
        // Use the same endpoint as brand settings for consistency
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
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [token, router])

  // ✅ NEW: Fetch usage data
  useEffect(() => {
    if (!token || !user) return

    const fetchUsageData = async () => {
      try {
        // Fetch prompt usage from user data
        const promptLimit = PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || 'free'] || 20
        const promptsUsed = user?.promptsUsed ?? 0

        // Fetch image usage
        const imageRes = await fetch(`${API_BASE_URL}/api/dalle/usage`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        let imageUsage = {
          dailyImages: { used: 0, limit: 2, remaining: 2 },
          monthlyImages: { used: 0, limit: 10, remaining: 10 }
        }

        if (imageRes.ok) {
          const imageData = await imageRes.json()
          if (imageData && imageData.dailyImages && imageData.monthlyImages) {
            imageUsage = {
              dailyImages: imageData.dailyImages,
              monthlyImages: imageData.monthlyImages
            }
          }
        }

        setUsageData({
          promptsUsed,
          promptLimit,
          dailyImages: imageUsage.dailyImages,
          monthlyImages: imageUsage.monthlyImages,
          subscriptionName: user?.subscriptionType || 'Free'
        })

      } catch (error) {
        console.error('Error fetching usage data:', error)
        // Set fallback data
        const promptLimit = PROMPT_LIMITS[user?.subscriptionType?.toLowerCase() || 'free'] || 20
        const promptsUsed = user?.promptsUsed ?? 0
        
        setUsageData({
          promptsUsed,
          promptLimit,
          dailyImages: { used: 0, limit: 2, remaining: 2 },
          monthlyImages: { used: 0, limit: 10, remaining: 10 },
          subscriptionName: user?.subscriptionType || 'Free'
        })
      }
    }

    fetchUsageData()
  }, [token, user])

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

  // ✅ NEW: Helper functions for usage display
  const getPromptUsagePercentage = () => {
    if (!usageData) return 0
    return Math.min(100, (usageData.promptsUsed / usageData.promptLimit) * 100)
  }

  const getPromptUsageColor = () => {
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
    if (remaining <= 2) return 'from-orange-500 to-red-500'
    return 'from-purple-500 to-blue-500'
  }

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

  const resetInfo = getResetInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your profile and account preferences</p>
          </div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-8">
          
          {/* ✅ NEW: Usage & Limits Section */}
          {usageData && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usage & Limits</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track your current plan usage and limits</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Prompt Usage */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      💬 Chat Prompts
                    </h3>
                    <Link 
                      href="/change-plan"
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {usageData.subscriptionName} Plan
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {usageData.promptsUsed}/{usageData.promptLimit === -1 ? '∞' : usageData.promptLimit}
                      </span>
                    </div>
                    
                    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getPromptUsageColor()} rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${Math.min(getPromptUsagePercentage(), 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{usageData.promptLimit - usageData.promptsUsed} remaining</span>
                      <span>{getPromptUsagePercentage().toFixed(1)}% used</span>
                    </div>
                    
                    {usageData.promptsUsed >= usageData.promptLimit * 0.9 && (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        ⚠️ You're approaching your limit. Consider upgrading for unlimited prompts.
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Usage */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-500" />
                      Image Generation
                    </h3>
                    <Link 
                      href="/change-plan"
                      className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                    <div className="space-y-3">
                      {/* Daily Images */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Images</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {usageData.dailyImages.remaining}/{usageData.dailyImages.limit === -1 ? '∞' : usageData.dailyImages.limit}
                          </span>
                        </div>
                        
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getImageUsageColor()} rounded-full transition-all duration-300 ease-out`}
                            style={{ width: `${Math.min(getImageUsagePercentage(), 100)}%` }}
                          />
                        </div>
                        
                        {usageData.dailyImages.remaining <= 0 && (
                          <div className="text-xs text-red-500 mt-1">
                            Resets in {resetInfo.hoursUntilMidnight} hours
                          </div>
                        )}
                      </div>

                      {/* Monthly Images */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Images</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {usageData.monthlyImages.remaining}/{usageData.monthlyImages.limit === -1 ? '∞' : usageData.monthlyImages.limit}
                          </span>
                        </div>
                        
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out`}
                            style={{ 
                              width: `${usageData.monthlyImages.limit === -1 ? 20 : Math.min((usageData.monthlyImages.used / usageData.monthlyImages.limit) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        
                        {usageData.monthlyImages.remaining <= 2 && usageData.monthlyImages.limit !== -1 && (
                          <div className="text-xs text-orange-500 mt-1">
                            Resets in {resetInfo.daysUntilNextMonth} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Prompt */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Need more capacity?</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Upgrade your plan for higher limits and unlimited access.</p>
                  </div>
                  <Link 
                    href="/change-plan"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tutorial Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Started</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Need a refresher on how Growfly works?</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">Take the Growfly Tour</h3>
                  <p className="text-purple-600 dark:text-purple-400 text-sm mb-4">
                    Discover all the powerful features that make Growfly unique to your business. 
                    Perfect for new users or as a refresher on our latest updates!
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-500 dark:text-purple-400">
                    <span>🚀</span>
                    <span>Interactive tour of all features</span>
                    <span>•</span>
                    <span>📱</span>
                    <span>Takes about 2 minutes</span>
                    <span>•</span>
                    <span>✨</span>
                    <span>Learn pro tips & tricks</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('startGrowflyTour'))}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Start Tour
                </button>
              </div>
            </div>
          </div>
          
          {/* Account Information */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Information</h2>
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
                  className="w-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl p-4 border border-gray-200 dark:border-slate-600 cursor-not-allowed"
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
                    className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl p-4 border border-gray-200 dark:border-slate-600 cursor-not-allowed capitalize"
                  />
                  <Link 
                    href="/change-plan"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                saveSuccess 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
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
              className="inline-flex items-center gap-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <CreditCard className="h-5 w-5" />
              Manage Billing & Invoices
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your settings have been updated successfully!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}