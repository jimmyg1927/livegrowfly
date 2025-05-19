'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchParams) {
      setError('Missing search parameters.')
      setLoading(false)
      return
    }

    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setError('Missing session ID.')
      setLoading(false)
      return
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/confirm-payment?session_id=${sessionId}`
        )
        const data = await res.json()

        if (data.token) {
          localStorage.setItem('growfly_jwt', data.token)
          router.push('/onboarding')
        } else {
          setError('Failed to confirm payment.')
        }
      } catch (err) {
        setError('Error confirming payment.')
      } finally {
        setLoading(false)
      }
    }

    confirmPayment()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#e6f7ff] text-black">
        <Image src="/growfly-logo.png" alt="Growfly" width={120} height={40} className="mb-6" />
        <p className="text-xl font-semibold">Just a sec — we're getting your account ready! ⚙️</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-600 text-white">
        <Image src="/growfly-logo.png" alt="Growfly" width={120} height={40} className="mb-6" />
        <p className="text-xl font-semibold">{error}</p>
      </div>
    )
  }

  return null
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#e6f7ff] text-black">
        <p>Loading...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
