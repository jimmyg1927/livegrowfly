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
      <label className="block text-sm font-semibold mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
        />
      ) : (
        <input
          type="text"
          name={name}
          value={form[name]}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1992FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-8">
        <div className="flex justify-center mb-4">
          {/* Your real logo here */}
          <Image
            src="/growfly-logo.png"
            alt="Growfly"
            width={160}
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

        {/* XP */}
        <div className="mb-8">
          <p className="text-sm font-medium mb-1">
            XP Progress: {xp} / {total}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1992FF] transition-all"
              style={{ width: `${(xp / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Stepper */}
        <div className="flex justify-center gap-6 mb-8">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`text-sm font-semibold ${
                step === n
                  ? 'text-[#1992FF] underline'
                  : 'text-gray-400 hover:text-[#1992FF]'
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

        {/* Fields */}
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
              'Witty and expert',
              true
            )}
            {renderField(
              'Mission',
              'brandMission',
              'Making AI marketing effortless',
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
              'Automate content, grow reach',
              true
            )}
          </>
        )}

        {/* Nav Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 bg-[#1992FF] text-white rounded-full hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={saveAll}
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
