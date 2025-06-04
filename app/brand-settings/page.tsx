'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'

// Mock API_BASE_URL for artifact
const API_BASE_URL = 'https://api.example.com'

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null
        const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data
          }))
        }
      } catch {
        // Toast would be called here in real app
        console.error('Failed to load brand settings.')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null
      await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      })
      // Toast would be called here in real app
      console.log('Brand settings saved!')
    } catch {
      // Toast would be called here in real app
      console.error('Something went wrong saving your settings.')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (
    label: string,
    name: keyof typeof formData,
    placeholder: string,
    description: string,
    textarea = false
  ) => (
    <div className="space-y-3">
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
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Brand Settings
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Help Growfly generate better results by sharing your brand&apos;s tone, audience, and mission. The more you tell us,
            the smarter your responses become.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            You can update this anytime.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          
          {/* Brand Identity Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Identity</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audience</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {renderField('Who is your audience?', 'audienceType', 'Startup founders, content creators', 'Demographics or job titles', true)}
              {renderField('Audience Goals or Challenges', 'audienceInterests', 'Affordable, fast content support', 'What are they trying to achieve?', true)}
              {renderField('Location Focus', 'locationFocus', 'UK-based, global customers', 'Where are you based and where do you sell?', true)}
            </div>
          </div>

          {/* Marketing Strategy Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Strategy</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {renderField('Primary Marketing Channels', 'platformFocus', 'Instagram, LinkedIn, Email', 'Where do you primarily publish content?', true)}
              {renderField('Main Products or Services', 'primaryProducts', 'Prompt engine, audits, templates', 'List your top 2–3 offerings', true)}
              {renderField('Unique Selling Points (USP)', 'USP', 'Faster and cheaper than hiring an agency', 'Why do customers choose you?', true)}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'Saving Your Settings...' : 'Save Brand Settings'}
          </button>
          
          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Changes are saved automatically to your account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}