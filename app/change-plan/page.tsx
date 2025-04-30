// app/change-plan/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  { id: 'free', name: 'Free', description: '5 prompts/month' },
  { id: 'personal', name: 'Personal', description: '50 prompts/month - £8.99/mo' },
  { id: 'entrepreneur', name: 'Entrepreneur', description: '250 prompts - £16.99/mo' },
  { id: 'business', name: 'Business', description: '1200 prompts - £49.99/mo' },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [message, setMessage] = useState('')
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('growfly_jwt')
    : null

  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  const handlePlanChange = async () => {
    if (!selectedPlan) {
      setMessage('Please select a plan.')
      return
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/change-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscriptionType: selectedPlan }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error updating plan')
      setMessage('✅ Plan updated successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
    }
  }

  return (
    <div className="min-h-full bg-[#2daaff] text-white p-6 flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">Change Your Plan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`
              p-6 bg-white text-black rounded-xl shadow hover:shadow-lg transition-transform
              ${selectedPlan === plan.id ? 'border-4 border-blue-600 scale-105' : ''}
            `}
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-sm mt-2">{plan.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handlePlanChange}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
      >
        Update Plan
      </button>

      {message && <p className="mt-4 text-white font-medium">{message}</p>}
    </div>
  )
}
