'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/constants'

const initialForm = {
  brandName: '',
  brandTone: '',
  brandDescription: '',
  brandValues: '',
  brandVoice: '',
  brandMission: '',
  inspiredBy: '',
  jobTitle: '',
  industry: '',
  goals: ''
}

export default function OnboardingPage() {
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [xp, setXp] = useState(0)
  const totalFields = Object.keys(initialForm).length

  // Count completed fields as XP
  useEffect(() => {
    const completed = Object.values(form).filter((v) => v.trim() !== '').length
    setXp(completed)
  }, [form])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 1))
  const handleNext = () => setStep((s) => Math.min(s + 1, 3))

  const handleFinish = async () => {
    if (!token) return toast.error('Not authenticated')
    const id = toast.loading('🎯 Saving your info...')
    try {
      // 1) Save brand settings
      const resSettings = await fetch(
        `${API_BASE_URL}/api/user/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      )
      // 2) Post the earned XP
      const resXp = await fetch(
        `${API_BASE_URL}/api/user/xp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ xp })
        }
      )
      if (!resSettings.ok || !resXp.ok) throw new Error()
      toast.success('✅ All done! Redirecting...', { id })
      router.push('/dashboard')
    } catch {
      toast.error('❌ Failed to save. Try again.', { id })
    }
  }

  const renderField = (
    label: string,
    name: keyof typeof initialForm,
    placeholder: string,
    textarea = false
  ) => (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          className="w-full border-b border-gray-300 focus:border-blue-600 focus:outline-none py-2 transition"
        />
      ) : (
        <input
          type="text"
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border-b border-gray-300 focus:border-blue-600 focus:outline-none py-2 transition"
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/growfly-logo.png"
            alt="Growfly Logo"
            width={120}
            height={40}
          />
        </div>
        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Let&apos;s make Growfly personal ✨
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Answer a few quick things so our nerds can tailor your AI to your brand.
        </p>

        {/* XP Bar */}
        <div className="mb-8">
          <p className="text-sm font-medium mb-1">
            XP Progress: {xp} / {totalFields}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(xp / totalFields) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-8 text-sm font-semibold mb-6">
          <button
            className={
              step === 1
                ? 'text-blue-600 underline'
                : 'text-gray-400 hover:underline'
            }
            onClick={() => setStep(1)}
          >
            1. Brand
          </button>
          <button
            className={
              step === 2
                ? 'text-blue-600 underline'
                : 'text-gray-400 hover:underline'
            }
            onClick={() => setStep(2)}
          >
            2. Audience
          </button>
          <button
            className={
              step === 3
                ? 'text-blue-600 underline'
                : 'text-gray-400 hover:underline'
            }
            onClick={() => setStep(3)}
          >
            3. About You
          </button>
        </div>

        {/* Form Fields */}
        <div>
          {step === 1 && (
            <>
              {renderField('Brand Name', 'brandName', 'Growfly Ltd')}
              {renderField(
                'Tone of Voice',
                'brandTone',
                'Bold, clever, confident'
              )}
              {renderField(
                'Elevator Pitch',
                'brandDescription',
                'We help brands grow using AI.',
                true
              )}
              {renderField(
                'Core Values',
                'brandValues',
                'Trust, Innovation, Simplicity',
                true
              )}
              {renderField(
                'Brand Personality',
                'brandVoice',
                'Witty and expert',
                true
              )}
              {renderField(
                'Mission',
                'brandMission',
                'Make AI marketing easier for all',
                true
              )}
            </>
          )}

          {step === 2 && (
            <>
              {renderField(
                'Inspired By',
                'inspiredBy',
                'Notion, Midjourney, Slack',
                true
              )}
            </>
          )}

          {step === 3 && (
            <>
              {renderField(
                'Your Job Title',
                'jobTitle',
                'Marketing Director'
              )}
              {renderField('Your Industry', 'industry', 'E-commerce')}
              {renderField(
                'Goals with Growfly',
                'goals',
                'Automate more content, grow reach',
                true
              )}
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
