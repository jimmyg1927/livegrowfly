'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'

// In your real app, import these properly:
// import { toast } from 'react-hot-toast'
// import { API_BASE_URL } from '@lib/constants'

// Mock for artifact
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'

export default function BrandSettingsPage() {
  const [formData, setFormData] = useState({
    brandName: '',
    brandDescription: '',
    brandValues: '',
    brandTone: '',
    brandVoice: '',
    brandMission: '',
    audienceType: '',
    audienceInterests: '',
    locationFocus: '',
    platformFocus: '',
    primaryProducts: '',
    USP: '',
    inspiredBy: '', // ✅ New field
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('growfly_jwt')
        if (!token) {
          setLoading(false)
          return
        }
        
        // Fetch user settings/profile data from the correct endpoint
        const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const userData = await res.json()

        if (userData) {
          // Map the user data to form fields
          const mappedData = {
            brandName: userData.brandName || '',
            brandDescription: userData.brandDescription || '',
            brandValues: userData.brandValues || '',
            brandTone: userData.brandTone || '',
            brandVoice: userData.brandVoice || '',
            brandMission: userData.brandMission || '',
            audienceType: userData.audienceType || '',
            audienceInterests: userData.audienceInterests || '',
            locationFocus: userData.locationFocus || '',
            platformFocus: userData.platformFocus || '',
            primaryProducts: userData.primaryProducts || '',
            USP: userData.USP || '',
            inspiredBy: userData.inspiredBy || '',
          }
          
          setFormData(mappedData)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load brand settings'
        console.error('Error fetching user settings:', errorMessage)
        // In real app: toast.error('Failed to load brand settings.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (saving) return
    
    try {
      setSaving(true)
      setSaveSuccess(false)
      
      const token = localStorage.getItem('growfly_jwt')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }

      // Update user profile with brand settings using the correct endpoint
      const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`)
      }

      const result = await res.json()
      
      // Show success feedback
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000) // Hide after 3 seconds
      
      // In real app: toast.success('Brand settings saved successfully!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error saving brand settings:', errorMessage)
      // In real app: toast.error('Failed to save brand settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (
    label: string,
    name: string,
    placeholder: string,
    description: string,
    textarea = false
  ) => (
    <div className="space-y-2">
      <div>
        <label htmlFor={name} className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </label>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={formData[name as keyof typeof formData] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={formData[name as keyof typeof formData] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
        />
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-slate-300 text-sm">Loading brand settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Brand Settings
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Help Growfly generate better results by sharing your brand&apos;s tone, audience, and mission. The more you tell us,
            the smarter your responses become.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
            You can update this anytime.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Brand Identity Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Brand Identity</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {renderField('Brand Name', 'brandName', 'Growfly Ltd', 'Used in bios, intros, and tone')}
              {renderField('Tone of Voice', 'brandTone', 'Bold, friendly, expert', 'How should the AI speak on your behalf?')}
              {renderField('Elevator Pitch', 'brandDescription', 'We help brands grow using AI.', 'Short sentence on what your business does', true)}
              {renderField('Core Values', 'brandValues', 'Trust, Innovation, Simplicity', 'List your values', true)}
              {renderField('Brand Personality', 'brandVoice', 'Witty and clever', 'Describe your brand like a personality', true)}
              {renderField('Mission', 'brandMission', 'Make marketing more accessible', 'What drives your brand?', true)}
              {renderField('Inspired By', 'inspiredBy', 'Apple, Tesla, Airbnb (separate with commas)', 'Who are your brand inspirations?', true)}
            </div>
          </div>

          {/* Audience Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audience</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {renderField('Who is your audience?', 'audienceType', 'Startup founders, content creators', 'Demographics or job titles', true)}
              {renderField('Audience Goals or Challenges', 'audienceInterests', 'Affordable, fast content support', 'What are they trying to achieve?', true)}
              {renderField('Location Focus', 'locationFocus', 'UK-based, global customers', 'Where are you based and where do you sell?', true)}
            </div>
          </div>

          {/* Marketing Strategy Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Marketing Strategy</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {renderField('Primary Marketing Channels', 'platformFocus', 'Instagram, LinkedIn, Email', 'Where do you primarily publish content?', true)}
              {renderField('Main Products or Services', 'primaryProducts', 'Prompt engine, audits, templates', 'List your top 2–3 offerings', true)}
              {renderField('Unique Selling Points (USP)', 'USP', 'Faster and cheaper than hiring an agency', 'Why do customers choose you?', true)}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              saveSuccess 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Your Settings...
              </>
            ) : saveSuccess ? (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Successfully Saved!
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Brand Settings
              </>
            )}
          </button>
          
          {/* Success Message */}
          {saveSuccess && (
            <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your brand settings have been updated successfully! Growfly will now use this information to personalize your responses.
              </div>
            </div>
          )}
          
          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Changes are saved automatically to your account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}