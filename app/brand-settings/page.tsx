'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

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
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/user/settings')
        if (res.data) {
          setFormData(res.data)
        }
      } catch (err) {
        toast.error('Failed to load brand settings.')
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
      await axios.put('/api/user/settings', formData)
      toast.success('Brand settings saved successfully!')
    } catch (err) {
      toast.error('Error saving settings. Try again.')
    }
  }

  if (loading) return <div className="p-6 text-muted text-sm">Loading brand data...</div>

  const renderField = (
    label: string,
    name: keyof typeof formData,
    placeholder: string,
    description: string,
    textarea: boolean = false
  ) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-textPrimary">{label}</label>
      <p className="text-xs text-muted mb-1">{description}</p>
      {textarea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-background rounded-md p-2 text-sm"
          rows={3}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-background rounded-md p-2 text-sm"
        />
      )}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Brand Settings</h1>
      <p className="text-sm text-muted mb-8 leading-relaxed">
        <strong>Why do we ask for this?</strong> <br />
        To deliver marketing help that <em>feels like it knows your business</em>. The more detail you provide,
        the more accurate and tailored your AI outputs will be — from ad copy and social posts to full strategy plans.
        You can update this information any time as your business grows and evolves.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold mb-3">🏷️ Brand Identity</h2>
          {renderField('Business or Brand Name', 'brandName', 'Growfly Ltd', 'Used in intros, bios, CTAs')}
          {renderField('What does your business do?', 'brandDescription', 'We help brands grow using AI tools', 'Short 1–2 sentence elevator pitch', true)}
          {renderField('Core Values', 'brandValues', 'Innovation, transparency, fun', 'What principles define your brand?', true)}
          {renderField('Tone of Voice', 'brandTone', 'Confident, friendly, informal', 'How should Growfly sound when speaking for you?')}
          {renderField('Personality or Vibe', 'brandVoice', 'Playful and clever', 'Describe your brand like a personality', true)}
          {renderField('Mission or Long-Term Goal', 'brandMission', 'Help small businesses win at marketing', 'What drives your brand?', true)}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">👥 Your Audience</h2>
          {renderField('Who are your ideal customers?', 'audienceType', 'Startups, creators, local brands', 'Job titles, industries or demographics', true)}
          {renderField('Customer Interests or Pain Points', 'audienceInterests', 'They want affordable, fast content support', 'What are they trying to solve or achieve?', true)}
          {renderField('Where are you based and where are your customers?', 'locationFocus', 'UK-based, but selling globally', 'Used for geo-targeted messaging and strategy', true)}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">📣 Marketing Strategy</h2>
          {renderField('Primary Marketing Channels', 'platformFocus', 'Instagram, LinkedIn, Email', 'Where are you most active?', true)}
          {renderField('Top Products or Services', 'primaryProducts', 'Prompt-based marketing, growth audits', 'Mention 2–3 core offers', true)}
          {renderField('Unique Selling Points (USP)', 'USP', 'Cheaper, faster and easier than hiring an agency', 'Why should someone choose you over competitors?', true)}
        </section>
      </div>

      <div className="sticky bottom-4 bg-white dark:bg-black border-t mt-10 pt-5 pb-3 flex justify-center">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
        >
          Save Brand Settings
        </button>
      </div>
    </div>
  )
}
