'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/constants'

type FormState = {
  brandName: string
  brandDescription: string
  brandVoice: string
  brandMission: string
  inspiredBy: string
  jobTitle: string
  industry: string
  goals: string
}

const INITIAL_FORM: FormState = {
  brandName: '',
  brandDescription: '',
  brandVoice: '',
  brandMission: '',
  inspiredBy: '',
  jobTitle: '',
  industry: '',
  goals: '',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<number>(1)
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM })
  const [xp, setXp] = useState<number>(0)
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const tokenRef = useRef<string | null>(null)

  useEffect(() => {
    tokenRef.current = localStorage.getItem('growfly_jwt')
    if (!tokenRef.current) {
      router.push('/login')
    }
  }, [])

  useEffect(() => {
    const filled = Object.values(form).filter((v) => v.trim() !== '').length
    setXp(filled)
  }, [form])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setTouchedFields((prev) => ({ ...prev, [name]: true }))
  }

  const requiredFields: Record<number, (keyof FormState)[]> = {
    1: ['brandName', 'brandDescription', 'brandVoice', 'brandMission'],
    2: ['inspiredBy'],
    3: ['jobTitle', 'industry', 'goals'],
  }

  const validateCurrentStep = () => {
    const missing = requiredFields[step].filter(
      (field) => form[field]?.trim() === ''
    )
    if (missing.length > 0) {
      toast.error('❌ Please complete all fields.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!tokenRef.current) {
      router.push('/login')
      return
    }

    if (!validateCurrentStep()) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error()
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
  ) => {
    const isError =
      touchedFields[name] &&
      requiredFields[step].includes(name) &&
      form[name].trim() === ''

    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        {textarea ? (
          <textarea
            name={name}
            rows={3}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${isError ? 'border-red-500' : 'border-white/30'}`}
          />
        ) : (
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${isError ? 'border-red-500' : 'border-white/30'}`}
          />
        )}
        {isError && (
          <p className="text-red-400 text-xs mt-1">This field is required.</p>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] px-6 py-10 text-white">
      <div className="flex justify-center mb-4">
        <Image src="/growfly-logo.png" alt="Growfly" width={140} height={40} />
      </div>

      <h1 className="text-2xl font-bold text-center mb-1">
        Let&rsquo;s make Growfly personal ✨
      </h1>
      <p className="text-center text-white/80 mb-4">
        Answer a few quick things so our nerds can tailor your AI to your brand.
      </p>

      <div className="mb-6 max-w-xl mx-auto">
        <p className="text-sm font-medium mb-1 text-center">XP Progress: {xp} / {Object.keys(INITIAL_FORM).length}</p>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1992FF] transition-all"
            style={{ width: `${(xp / Object.keys(INITIAL_FORM).length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 text-sm font-semibold mb-6">
        {['Brand', 'Inspired By...', 'About You'].map((label, index) => (
          <button
            key={index}
            onClick={() => setStep(index + 1)}
            className={`px-4 py-2 rounded-full transition ${
              step === index + 1
                ? 'bg-[#1992FF] text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {step === 1 && (
          <>
            {renderField('Brand Name', 'brandName', 'Growfly Ltd')}
            {renderField('Elevator Pitch', 'brandDescription', 'We help brands grow using AI.', true)}
            {renderField('Brand Personality', 'brandVoice', 'Witty and expert', true)}
            {renderField('Mission', 'brandMission', 'Make AI marketing easier for all', true)}
          </>
        )}
        {step === 2 && (
          <>
            {renderField('Inspired By', 'inspiredBy', 'What companies or competitors inspire you?', true)}
          </>
        )}
        {step === 3 && (
          <>
            {renderField('Your Job Title', 'jobTitle', 'Marketing Director')}
            {renderField('Your Industry', 'industry', 'E-commerce')}
            {renderField('Goals with Growfly', 'goals', 'More sales, increase productivity, grow reach', true)}
          </>
        )}
      </div>

      <div className="flex justify-between mt-8 max-w-xl mx-auto">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition"
          >
            Back
          </button>
        ) : <div />}
        {step < 3 ? (
          <button
            onClick={() => {
              if (validateCurrentStep()) {
                setStep((s) => s + 1)
              }
            }}
            className="px-4 py-2 bg-[#1992FF] text-white rounded-full hover:bg-blue-600 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#1992FF] text-white rounded-full hover:bg-blue-600 transition"
          >
            Finish &amp; Start Journey
          </button>
        )}
      </div>
    </main>
  )
}
