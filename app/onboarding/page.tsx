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
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const [step, setStep] = useState<number>(1)
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM })
  const [xp, setXp] = useState<number>(0)
  const totalFields = Object.keys(INITIAL_FORM).length

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
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const settingsRes = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(form),
      })

      const xpRes = await fetch(`${API_BASE_URL}/api/user/xp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ xp }),
      })

      if (!settingsRes.ok || !xpRes.ok) throw new Error()

      toast.success('🎉 Onboarding complete!')
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
      <label className="block text-sm font-medium text-white mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          className="w-full p-3 bg-white/10 text-white border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
        />
      ) : (
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full p-3 bg-white/10 text-white border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
        />
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#0B1C39] flex flex-col items-center justify-center px-6 py-16 text-white">
      <div className="mb-8">
        <Image src="/growfly-logo.png" alt="Growfly Logo" width={160} height={160} />
      </div>

      <h1 className="text-4xl font-extrabold text-center mb-2">Let&apos;s make Growfly personal ✨</h1>
      <p className="text-center text-gray-300 mb-6">
        Answer a few quick things so our nerds can tailor your AI to your brand.
      </p>

      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium mb-1 text-white">XP Progress: {xp} / {totalFields}</p>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1992FF] transition-all"
              style={{ width: `${(xp / totalFields) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-6 text-sm font-semibold mb-8">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`px-4 py-1 rounded-full transition ${
                step === n
                  ? 'bg-[#1992FF] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {n === 1 && '1. Brand'}
              {n === 2 && '2. Audience'}
              {n === 3 && '3. About You'}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {step === 1 && (
            <>
              {renderField('Brand Name', 'brandName', 'Growfly Ltd')}
              {renderField('Tone of Voice', 'brandTone', 'Bold, clever, confident')}
              {renderField('Elevator Pitch', 'brandDescription', 'We help brands grow using AI.', true)}
              {renderField('Core Values', 'brandValues', 'Trust, Innovation, Simplicity', true)}
              {renderField('Brand Personality', 'brandVoice', 'Witty and expert', true)}
              {renderField('Mission', 'brandMission', 'Make AI marketing easier for all', true)}
            </>
          )}
          {step === 2 && (
            <>
              {renderField('Inspired By', 'inspiredBy', 'Notion, Midjourney, Slack', true)}
            </>
          )}
          {step === 3 && (
            <>
              {renderField('Your Job Title', 'jobTitle', 'Marketing Director')}
              {renderField('Your Industry', 'industry', 'E-commerce')}
              {renderField('Goals with Growfly', 'goals', 'Automate more content, grow reach', true)}
            </>
          )}
        </div>

        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 bg-[#1992FF] text-white rounded-xl hover:bg-[#147dd1] transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Finish &amp; Start Journey
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
