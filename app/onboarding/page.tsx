'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/constants'

type FormState = {
  brandName: string
  brandTone: string
  brandDescription: string
  brandValues: string
  brandVoice: string
  brandMission: string
  inspiredBy: string
  jobTitle: string
  industry: string
  goals: string
}

const INITIAL_FORM: FormState = {
  brandName: '',
  brandTone: '',
  brandDescription: '',
  brandValues: '',
  brandVoice: '',
  brandMission: '',
  inspiredBy: '',
  jobTitle: '',
  industry: '',
  goals: '',
}

export default function OnboardingPage() {
  const router = useRouter()
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const [step, setStep] = useState<number>(1)
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM })
  const [xp, setXp] = useState<number>(0)
  const totalFields = Object.keys(INITIAL_FORM).length

  // Recalculate XP whenever form changes
  useEffect(() => {
    const filled = Object.values(form).filter((v) => v.trim() !== '').length
    setXp(filled)
  }, [form])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Save brand settings
      const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      // Save XP
      const xpRes = await fetch(`${API_BASE_URL}/api/user/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ xp }),
      })

      if (!res.ok || !xpRes.ok) throw new Error()

      toast.success(`🎉 Onboarding complete!`)
      router.push('/dashboard')
    } catch {
      toast.error('❌ Something went wrong. Please try again.')
    }
  }

  const renderField = (
    label: string,
    name: keyof FormState,
    placeholder: string,
    textarea = false
  ) => (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md"
        />
      ) : (
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 p-2 rounded-md"
        />
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#1992FF] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/growfly-logo.png"
            alt="Growfly"
            width={160}
            height={48}
          />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-1">
          Let&rsquo;s make Growfly personal ✨
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Answer a few quick things so our nerds can tailor your AI to your brand.
        </p>

        {/* XP Bar */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-1">
            XP Progress: {xp} / {totalFields}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1992FF] transition-all"
              style={{ width: `${(xp / totalFields) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-8 text-sm font-semibold mb-6">
          <button
            onClick={() => setStep(1)}
            className={`px-2 ${
              step === 1 ? 'text-[#1992FF]' : 'text-gray-400'
            }`}
          >
            1. Brand
          </button>
          <button
            onClick={() => setStep(2)}
            className={`px-2 ${
              step === 2 ? 'text-[#1992FF]' : 'text-gray-400'
            }`}
          >
            2. Audience
          </button>
          <button
            onClick={() => setStep(3)}
            className={`px-2 ${
              step === 3 ? 'text-[#1992FF]' : 'text-gray-400'
            }`}
          >
            3. About You
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {step === 1 && (
            <>
              {renderField('Brand Name', 'brandName', 'Growfly Ltd')}
              {renderField('Tone of Voice', 'brandTone', 'Bold, clever, confident')}
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
              {renderField('Your Job Title', 'jobTitle', 'Marketing Director')}
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
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 bg-[#1992FF] text-white rounded hover:bg-[#166FCC] transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Finish &amp; Start Journey
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
