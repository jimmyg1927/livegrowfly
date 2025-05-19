'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConfirmPaymentPage() {
  const router = useRouter()
  const params = useSearchParams()
  const sessionId = params?.get('session_id')
  const [message, setMessage] = useState('Confirming payment...')

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId) {
        setMessage('Missing session ID')
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/confirm-payment?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Payment confirmation failed')

        localStorage.setItem('growfly_jwt', data.token)

        // Fetch user info
        const profile = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        }).then(r => r.json())

        router.push(profile.hasCompletedOnboarding ? '/dashboard' : '/onboarding')
      } catch (err: any) {
        setMessage(`❌ ${err.message}`)
      }
    }

    confirm()
  }, [sessionId, router])

  return (
    <main className="flex items-center justify-center h-screen text-center p-10 text-foreground">
      <p className="text-lg animate-pulse">{message}</p>
    </main>
  )
}
