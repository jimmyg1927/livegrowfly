'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/constants'

type FormState = {
  name: string
  email: string
  password: string
  confirmPassword: string
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const totalChars = Object.values(form).reduce((acc, val) => acc + val.trim().length, 0)
    setXp(Math.floor(totalChars * 0.06))
  }, [form])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouchedFields((prev) => ({ ...prev, [name]: true }))
  }

  const requiredFields: Record<number, (keyof FormState)[]> = {
    1: ['name', 'email', 'password', 'confirmPassword'],
    2: ['brandName', 'brandDescription', 'brandVoice', 'brandMission'],
    3: ['inspiredBy'],
    4: ['jobTitle', 'industry', 'goals'],
  }

  const validateStep = () => {
    const missing = requiredFields[step].filter((field) => form[field]?.trim() === '')
    if (missing.length > 0) {
      toast.error('❌ Please complete all fields.')
      return false
    }
    if (step === 1 && form.password !== form.confirmPassword) {
      toast.error('❌ Passwords do not match.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          jobTitle: form.jobTitle,
          industry: form.industry,
          plan: new URLSearchParams(window.location.search).get('plan') || 'free',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      localStorage.setItem('growfly_jwt', data.token)

      const totalXP = Math.floor(Object.values(form).reduce((acc, val) => acc + val.trim().length, 0) * 0.06)

      const brandRes = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          brandName: form.brandName,
          brandDescription: form.brandDescription,
          brandVoice: form.brandVoice,
          brandMission: form.brandMission,
          inspiredBy: form.inspiredBy,
          jobTitle: form.jobTitle,
          industry: form.industry,
          goals: form.goals,
          totalXP,
        }),
      })

      if (!brandRes.ok) throw new Error('Failed to save brand settings.')

      toast.success('🎉 Welcome to Growfly!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(`❌ ${err.message || 'Error during onboarding.'}`)
    } finally {
      setLoading(false)
    }
  }

  const renderField = (
    label: string,
    name: keyof FormState,
    placeholder: string,
    textarea = false,
    type = 'text'
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
            type={type}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${isError ? 'border-red-500' : 'border-white/30'}`}
          />
        )}
        {isError && <p className="text-red-400 text-xs mt-1">This field is required.</p>}
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
        <p className="text-sm font-medium mb-1 text-center">
          XP Progress: {xp} XP
        </p>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1992FF] transition-all"
            style={{ width: `${Math.min(xp, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-2 text-xs font-medium mb-6">
        {['Account', 'Brand', 'Inspired By...', 'About You'].map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i + 1)}
            className={`px-3 py-1 rounded-full ${
              step === i + 1
                ? 'bg-[#1992FF] text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {step === 1 && (
          <>
            {renderField('Name', 'name', 'John Doe')}
            {renderField('Email', 'email', 'john@example.com', false, 'email')}
            {renderField('Password', 'password', '••••••••', false, 'password')}
            {renderField('Confirm Password', 'confirmPassword', '••••••••', false, 'password')}
          </>
        )}
        {step === 2 && (
          <>
            {renderField('Brand Name', 'brandName', 'Growfly Ltd')}
            {renderField('Elevator Pitch', 'brandDescription', 'We help brands grow using AI.', true)}
            {renderField('Brand Personality', 'brandVoice', 'Witty and expert', true)}
            {renderField('Mission', 'brandMission', 'Make AI marketing easier for all', true)}
          </>
        )}
        {step === 3 && (
          <>
            {renderField('Inspired By', 'inspiredBy', 'What companies or competitors inspire you?', true)}
          </>
        )}
        {step === 4 && (
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
        ) : (
          <div />
        )}
        {step < 4 ? (
          <button
            onClick={() => {
              if (validateStep()) setStep((s) => s + 1)
            }}
            className="px-4 py-2 bg-[#1992FF] text-white rounded-full hover:bg-blue-600 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-[#1992FF] text-white rounded-full hover:bg-blue-600 transition"
          >
            {loading ? 'Submitting...' : 'Finish & Start Journey'}
          </button>
        )}
      </div>
    </main>
  )
}
