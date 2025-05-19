'use client'

import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()!
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId) {
        setError('Missing session ID.')
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/confirm-payment?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok || !data.token) {
          throw new Error(data.error || 'Could not confirm payment.')
        }

        localStorage.setItem('growfly_jwt', data.token)
        router.push('/onboarding')
      } catch (err: any) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    confirm()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-xl text-blue-700">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Confirming your payment...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-600 font-semibold">
        ❌ {error}
      </div>
    )
  }

  return null
}

export default function ConfirmPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <ConfirmContent />
    </div>
  )
}
