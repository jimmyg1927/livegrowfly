// app/onboarding/page.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

const INITIAL: FormState = {
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

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [xp, setXp] = useState(0)
  const total = Object.keys(INITIAL).length

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
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const xpRes = await fetch(`${API_BASE_URL}/api/user/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ xp }),
      })
      if (!res.ok || !xpRes.ok) throw new Error('Save failed')
      toast.success("🎉 You're all set! Redirecting…")
      router.push('/dashboard')
    } catch {
      toast.error('❌ Something went wrong, please try again.')
    }
  }

  const renderField = (
    label: string,
    name: keyof FormState,
    placeholder: string,
    textarea = false
  ) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1992FF] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Logo */}
        <div className="bg-[#1992FF] p-4 flex justify-center">
          <Image
            src="/growfly-logo.png"
            alt="Growfly"
            width={140}
            height={40}
          />
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Let's make Growfly personal ✨
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Answer a few quick things so our nerds can tailor your AI to your
            brand.
          </p>

          {/* XP Bar */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-1">
              XP Progress: {xp} / {total}
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-[#1992FF] rounded-full transition-all"
                style={{ width: `${(xp / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Nav */}
          <div className="flex justify-center space-x-8 mb-8 text-sm font-semibold">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1 rounded ${
                step === 1
                  ? 'bg-[#1992FF] text-white'
                  : 'text-gray-500 hover:text-[#1992FF]'
              }`}
            >
              1. Brand
            </button>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1 rounded ${
                step === 2
                  ? 'bg-[#1992FF] text-white'
                  : 'text-gray-500 hover:text-[#1992FF]'
              }`}
            >
              2. Audience
            </button>
            <button
              onClick={() => setStep(3)}
              className={`px-3 py-1 rounded ${
                step === 3
                  ? 'bg-[#1992FF] text-white'
                  : 'text-gray-500 hover:text-[#1992FF]'
              }`}
            >
              3. About You
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {step === 1 && (
              <>
                {renderField('Brand Name', 'brandName', 'e.g. Growfly Ltd')}
                {renderField('Tone of Voice', 'brandTone', 'e.g. Bold, clever')}
                {renderField(
                  'Elevator Pitch',
                  'brandDescription',
                  'We help brands grow with AI.',
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
                  'Witty & expert',
                  true
                )}
                {renderField(
                  'Mission',
                  'brandMission',
                  'Make AI marketing simpler',
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
                {renderField('Your Job Title', 'jobTitle', 'Marketing Lead')}
                {renderField('Your Industry', 'industry', 'E-commerce')}
                {renderField(
                  'Goals with Growfly',
                  'goals',
                  'Automate my content',
                  true
                )}
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-6 py-2 rounded-lg bg-[#1992FF] text-white hover:bg-[#166FCC]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Finish &amp; Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
