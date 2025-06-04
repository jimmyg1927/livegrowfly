'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ExternalLink, CreditCard, ArrowUpRight } from 'lucide-react'
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
}

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
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

        <div className="space-y-8">{/* Replaced form tag */}
          
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
        </div>{/* End of replaced form */}
      </div>
    </div>
  )
}