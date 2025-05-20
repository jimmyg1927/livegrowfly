'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams?.get('token')

    if (!token) {
      setError('Missing token from Stripe redirect.')
      setLoading(false)
      return
    }

    try {
      localStorage.setItem('growfly_jwt', token)
      toast.success(`🎉 You're all set! Welcome aboard.`)
      router.push('/onboarding')
    } catch (err) {
      setError('Failed to process token. Please try logging in.')
      setLoading(false)
    }
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-blue-600">
        <p>Processing your payment... please wait 🚀</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-red-600">
        <p>{error}</p>
      </div>
    )
  }

  return null
}

export default function PaidSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-blue-600">
          Loading...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
