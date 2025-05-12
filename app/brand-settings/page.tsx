'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'

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
        const res = await axios.get('/api/user/settings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('growfly_jwt')}`,
          },
        })
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            ...res.data
          }))
        }
      } catch {
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
      setSaving(true)
      await axios.put('/api/user/settings', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('growfly_jwt')}`,
        },
      })
      toast.success('Brand settings saved!')
    } catch {
      toast.error('Something went wrong saving your settings.')
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
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-semibold text-foreground mb-1">
        {label}
      </label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-background text-foreground p-3 text-sm resize-none"
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
          className="w-full rounded-md border border-border bg-background text-foreground p-3 text-sm"
        />
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        <Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading brand settings...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-3xl font-bold mb-3">Brand Settings</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Help Growfly generate better results by sharing your brand’s tone, audience, and mission. The more you tell us,
        the smarter your responses become. <br />
        <span className="text-xs italic">You can update this anytime.</span>
      </p>

      <div className="space-y-14">
        {/* Brand Identity */}
        <section>
          <h2 className="text-xl font-semibold mb-6 border-b border-border pb-2">🏷️ Brand Identity</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {renderField('Brand Name', 'brandName', 'Growfly Ltd', 'Used in bios, intros, and tone')}
            {renderField('Tone of Voice', 'brandTone', 'Bold, friendly, expert', 'How should the AI speak on your behalf?')}
            {renderField('Elevator Pitch', 'brandDescription', 'We help brands grow using AI.', 'Short sentence on what your business does', true)}
            {renderField('Core Values', 'brandValues', 'Trust, Innovation, Simplicity', 'List your values', true)}
            {renderField('Brand Personality', 'brandVoice', 'Witty and clever', 'Describe your brand like a personality', true)}
            {renderField('Mission', 'brandMission', 'Make marketing more accessible', 'What drives your brand?', true)}
            {renderField('Inspired By', 'inspiredBy', 'Put the companies you are inspired by in this text box, separate them with commas', 'Who are your brand inspirations?', true)}
          </div>
        </section>

        {/* Audience */}
        <section>
          <h2 className="text-xl font-semibold mb-6 border-b border-border pb-2">👥 Audience</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {renderField('Who is your audience?', 'audienceType', 'Startup founders, content creators', 'Demographics or job titles', true)}
            {renderField('Audience Goals or Challenges', 'audienceInterests', 'Affordable, fast content support', 'What are they trying to achieve?', true)}
            {renderField('Location Focus', 'locationFocus', 'UK-based, global customers', 'Where are you based and where do you sell?', true)}
          </div>
        </section>

        {/* Strategy */}
        <section>
          <h2 className="text-xl font-semibold mb-6 border-b border-border pb-2">📣 Marketing Strategy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {renderField('Primary Marketing Channels', 'platformFocus', 'Instagram, LinkedIn, Email', 'Where do you primarily publish content?', true)}
            {renderField('Main Products or Services', 'primaryProducts', 'Prompt engine, audits, templates', 'List your top 2–3 offerings', true)}
            {renderField('Unique Selling Points (USP)', 'USP', 'Faster and cheaper than hiring an agency', 'Why do customers choose you?', true)}
          </div>
        </section>
      </div>

      <div className="mt-14 flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Brand Settings'}
        </button>
      </div>
    </div>
  )
}
