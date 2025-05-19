'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/constants'
import Image from 'next/image'

export default function OnboardingPage() {
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const initial = {
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

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initial)
  const [xp, setXp] = useState(0)
  const totalFields = Object.keys(initial).length

  useEffect(() => {
    const nonEmptyCount = Object.values(form).filter(v => v.trim() !== '').length
    setXp(nonEmptyCount)
  }, [form])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form })
      })

      const xpRes = await fetch(`${API_BASE_URL}/api/user/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ xp })
      })

      if (!res.ok || !xpRes.ok) throw new Error('Update failed')
      toast.success("🎉 You\'re all set! Welcome aboard, nerd hero.")
      router.push('/dashboard')
    } catch (err: any) {
      toast.error('Something went wrong saving your data.')
    }
  }

  const renderField = (label: string, name: keyof typeof form, placeholder: string, textarea = false) => (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      {textarea ? (
        <textarea name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} rows={3} className="w-full border border-gray-300 p-2 rounded-md" />
      ) : (
        <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className="w-full border border-gray-300 p-2 rounded-md" />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#e6f7ff] px-6 py-10 text-black">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Image src="/growfly-bot.png" alt="Bot" width={48} height={48} />
          <div>
            <h1 className="text-xl font-bold">Let's make Growfly personal ✨</h1>
            <p className="text-sm text-gray-600">Answer a few quick things so our nerds can tailor your AI to your brand.</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-8">
          <p className="text-sm font-medium mb-1">XP Progress: {xp} / {totalFields}</p>
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(xp / totalFields) * 100}%` }}></div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex justify-between text-sm font-semibold mb-4">
          <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>1. Brand</span>
          <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>2. Audience</span>
          <span className={step >= 3 ? 'text-blue-600' : 'text-gray-400'}>3. About You</span>
        </div>

        {/* Step Forms */}
        <div className="space-y-4">
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

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="text-sm px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="ml-auto text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Next</button>
          ) : (
            <button onClick={handleSubmit} className="ml-auto text-sm px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Finish</button>
          )}
        </div>
      </div>
    </div>
  )
}
