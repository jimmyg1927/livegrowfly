'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { API_BASE_URL } from '@lib/constants'

export default function ConfirmClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId) {
        setError('Missing session ID.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/confirm-payment?session_id=${sessionId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to confirm payment.')

        localStorage.setItem('growfly_jwt', data.token)
        router.push('/dashboard')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    confirm()
  }, [sessionId])

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto mb-2" />
        Confirming payment...
      </div>
    )
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">❌ {error}</div>
  }

  return null
}
