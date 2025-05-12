'use client'

import { useEffect, useState } from 'react'
import SignupClient from './SignupClient'
import { useSearchParams } from 'next/navigation'

export default function SignupPage() {
  const [plan, setPlan] = useState('Free')
  const searchParams = useSearchParams()

  useEffect(() => {
    const planFromURL = searchParams?.get('plan')
    if (planFromURL) {
      const formatted =
        planFromURL.charAt(0).toUpperCase() + planFromURL.slice(1).toLowerCase()
      setPlan(formatted)
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-black text-white py-16 px-4 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white text-black rounded-2xl p-10 shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Sign up for {plan} Plan
        </h1>
        <SignupClient />
      </div>
    </main>
  )
}
