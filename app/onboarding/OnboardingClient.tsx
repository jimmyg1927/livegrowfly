// File: app/onboarding/OnboardingClient.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '@lib/constants'

type FormState = {
  name: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
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
  companyName: '',
  brandDescription: '',
  brandVoice: '',
  brandMission: '',
  inspiredBy: '',
  jobTitle: '',
  industry: '',
  goals: '',
}

export default function OnboardingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams?.get('plan') ?? 'free'

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof FormState, boolean>>>({})

  useEffect(() => {
    const totalChars = Object.values(form).reduce((acc, val) => acc + val.trim().length, 0)
    setXp(Math.floor(totalChars * 0.05))
  }, [form])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setTouchedFields(prev => ({ ...prev, [name]: true }))
  }

  const requiredFields: Record<number, (keyof FormState)[]> = {
    1: ['name', 'email', 'password', 'confirmPassword'],
    2: ['companyName', 'brandDescription', 'brandVoice', 'brandMission'],
    3: ['inspiredBy'],
    4: ['jobTitle', 'industry', 'goals'],
  }

  const validateStep = () => {
    const missing = requiredFields[step].filter(field => form[field].trim() === '')
    if (missing.length) {
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
    if (submittingRef.current) return
    submittingRef.current = true

    if (!validateStep()) {
      submittingRef.current = false
      return
    }
    setLoading(true)

    try {
      const signupRes = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          jobTitle: form.jobTitle,
          industry: form.industry,
          plan,
        }),
      })
      const signupData = await signupRes.json()
      if (signupRes.status === 409) {
        toast.error('❌ That email is already registered.')
        return
      }
      if (!signupRes.ok) throw new Error(signupData.error || 'Signup failed')

      const token = signupData.token
      localStorage.setItem('growfly_jwt', token)
      document.cookie = `growfly_jwt=${token}; path=/; max-age=604800`

      const totalXP = xp
      const settingsRes = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: form.companyName,
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
      if (!settingsRes.ok) throw new Error('Failed to save settings.')

      if (plan === 'free') {
        router.push('/dashboard')
      } else {
        const stripeRes = await fetch(`${API_BASE_URL}/api/checkout/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan }),
        })
        const { url } = await stripeRes.json()
        if (url) window.location.href = url
        else throw new Error('Stripe session failed.')
      }
    } catch (err: any) {
      toast.error(`❌ ${err.message || 'Error during onboarding.'}`)
    } finally {
      setLoading(false)
      submittingRef.current = false
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
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${
              isError ? 'border-red-500' : 'border-white/30'
            }`}
          />
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${
              isError ? 'border-red-500' : 'border-white/30'
            }`}
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

      <h1 className="text-2xl font-bold text-center mb-1">Let’s make Growfly personal ✨</h1>
      <p className="text-center text-white/80 mb-4">
        Answer a few quick things so our nerds can tailor your AI to your brand.
      </p>

      <div className="mb-6 max-w-xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-semibold">⭐ XP Earned: {xp} XP</span>
          <span className="text-xs underline cursor-help" title="The more detail you give, the more XP you earn toward perks!">
            ?
          </span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#72C8F6] transition-all"
            style={{ width: `${Math.min(xp, 100)}%` }}
          />
        </div>
        <p className="text-xs italic text-center text-[#72C8F6]">
          The more detail you give, the more XP you earn toward perks!
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        {['Account', 'Company', 'Inspired By...', 'About You'].map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i + 1)}
            className={`px-4 py-1 rounded-full text-xs font-semibold ${
              step === i + 1
                ? 'bg-[#72C8F6] text-black'
                : 'bg-white/20 text-white hover:bg-white/30'
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
            {renderField('Company Name', 'companyName', 'Acme Corp')}
            {renderField('Elevator Pitch', 'brandDescription', 'We help brands grow using AI.', true)}
            {renderField('Brand Personality', 'brandVoice', 'Witty and expert', true)}
            {renderField('Mission', 'brandMission', 'Make marketing easier for all', true)}
          </>
        )}
        {step === 3 && (
          <>
            {renderField('Inspired By', 'inspiredBy', 'Competitors you admire?', true)}
          </>
        )}
        {step === 4 && (
          <>
            {renderField('Your Job Title', 'jobTitle', 'Marketing Director')}
            {renderField('Your Industry', 'industry', 'E-commerce')}
            {renderField('Goals with Growfly', 'goals', 'More sales, increase productivity…', true)}
          </>
        )}
      </div>

      <div className="flex justify-between mt-8 max-w-xl mx-auto">
        {step > 1 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        {step < 4 ? (
          <button
            onClick={() => validateStep() && setStep(s => s + 1)}
            className="px-4 py-2 bg-[#72C8F6] text-black rounded-full hover:brightness-110 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 bg-[#72C8F6] text-black rounded-full hover:brightness-110 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting…' : 'Finish & Start Journey'}
          </button>
        )}
      </div>

      <p className="text-center text-white/70 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="underline hover:text-[#72C8F6]">
          Log in here
        </Link>
      </p>
    </main>
  )
}
