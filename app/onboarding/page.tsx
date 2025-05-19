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
  goals: '',
}

export default function OnboardingPage() {
  const router = useRouter()
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [xp, setXp] = useState(0)
  const total = Object.keys(initialForm).length

  useEffect(() => {
    setXp(Object.values(form).filter((v) => v.trim() !== '').length)
  }, [form])

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const saveAll = async () => {
    if (!token) return toast.error('Not authenticated')
    const id = toast.loading('Saving…')
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }),
        fetch(`${API_BASE_URL}/api/user/xp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ xp }),
        }),
      ])
      if (!r1.ok || !r2.ok) throw new Error()
      toast.success('All set! Redirecting…', { id })
      router.push('/dashboard')
    } catch {
      toast.error('Failed — try again', { id })
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
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="w-full px-0 pb-1 border-b border-gray-300 focus:border-blue-600 focus:outline-none transition"
        />
      ) : (
        <input
          type="text"
          name={name}
          value={form[name]}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-0 pb-1 border-b border-gray-300 focus:border-blue-600 focus:outline-none transition"
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/growfly-logo.png"
            alt="Growfly Logo"
            width={140}
            height={40}
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">
          Let&apos;s make Growfly personal ✨
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Answer a few quick things so our nerds can tailor your AI to your
          brand.
        </p>

        {/* XP Bar */}
        <div className="mb-8">
          <p className="text-sm font-medium mb-1">
            XP Progress: {xp} / {total}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(xp / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Stepper */}
        <div className="flex justify-center space-x-6 mb-8">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`text-sm font-medium ${
                step === n
                  ? 'text-blue-600 underline'
                  : 'text-gray-400 hover:text-blue-600'
              }`}
            >
              {n === 1
                ? '1. Brand'
                : n === 2
                ? '2. Audience'
                : '3. About You'}
            </button>
          ))}
        </div>

        {/* Form */}
        {step === 1 && (
          <>
            {renderField('Brand Name', 'brandName', 'Growfly Ltd')}
            {renderField('Tone of Voice', 'brandTone', 'Bold, confident')}
            {renderField(
              'Elevator Pitch',
              'brandDescription',
              'We help brands grow via AI.',
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

        {/* Pager Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={saveAll}
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
