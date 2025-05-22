'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM })
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState('free')
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setPlan(params.get('plan')?.toLowerCase() || 'free')
  }, [])

  useEffect(() => {
    const totalChars = Object.entries(form).reduce((acc, [key, val]) => {
      if (
        !['password', 'confirmPassword'].includes(key) &&
        typeof val === 'string'
      ) {
        acc += val.length
      }
      return acc
    }, 0)
    setXp(parseFloat((totalChars * 0.01).toFixed(2)))
  }, [form])

  const requiredFields: Record<number, (keyof FormState)[]> = {
    1: ['name', 'email', 'password', 'confirmPassword'],
    2: ['brandName', 'brandDescription', 'brandVoice', 'brandMission'],
    3: ['inspiredBy'],
    4: ['jobTitle', 'industry', 'goals'],
  }

  const validateStep = () => {
    const missing = requiredFields[step].filter(
      field => !form[field] || form[field].trim() === ''
    )
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          plan,
          totalXP: xp,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Signup failed')

      localStorage.setItem('growfly_jwt', data.token)

      if (plan === 'free') {
        router.push('/dashboard')
      } else {
        const stripeRes = await fetch(`${API_BASE_URL}/api/checkout/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan }),
        })
        const stripeData = await stripeRes.json()
        if (stripeData?.url) {
          window.location.href = stripeData.url
        } else {
          throw new Error(stripeData?.error || 'Stripe redirect failed')
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (
    label: string,
    name: keyof FormState,
    placeholder: string,
    textarea = false
  ) => {
    const isError = touched[name] && form[name].trim() === ''
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        {textarea ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={handleChange}
            rows={3}
            placeholder={placeholder}
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${isError ? 'border-red-500' : 'border-white/30'}`}
          />
        ) : (
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            type={name.toLowerCase().includes('password') ? 'password' : 'text'}
            className={`w-full bg-white/10 text-white border p-3 rounded-lg ${isError ? 'border-red-500' : 'border-white/30'}`}
          />
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1e3a8a] px-6 py-10 text-white">
      <div className="flex justify-center mb-6">
        <Image src="/growfly-logo.png" alt="Growfly" width={140} height={40} />
      </div>

      <h1 className="text-2xl font-bold text-center mb-1">Welcome to Growfly</h1>
      <p className="text-center text-white/80 mb-4">
        Let's tailor your AI — and earn XP as you go!
      </p>

      <div className="mb-6 max-w-xl mx-auto">
        <p className="text-sm font-medium mb-1 text-center">
          XP Progress: {Math.floor(xp)} XP
        </p>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1992FF] transition-all"
            style={{ width: `${Math.min((xp / 1000) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-2 text-sm font-semibold mb-6">
        {['Account', 'Brand', 'Inspiration', 'About You'].map((label, index) => (
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
            {renderField('Your Name', 'name', 'John Doe')}
            {renderField('Email', 'email', 'you@example.com')}
            {renderField('Password', 'password', '●●●●●●●●')}
            {renderField('Confirm Password', 'confirmPassword', '●●●●●●●●')}
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
            {renderField('Inspired By', 'inspiredBy', 'Notion, Duolingo, Midjourney', true)}
          </>
        )}
        {step === 4 && (
          <>
            {renderField('Your Job Title', 'jobTitle', 'Marketing Director')}
            {renderField('Your Industry', 'industry', 'E-commerce')}
            {renderField('Your Goals with Growfly', 'goals', 'Boost productivity, better content', true)}
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
            className="px-6 py-2 bg-[#1992FF] text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Finishing...' : 'Finish & Start Journey'}
          </button>
        )}
      </div>
    </main>
  )
}
