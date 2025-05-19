import { Suspense } from 'react'
import ConfirmClient from './ConfirmClient'

export default function ConfirmPaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading confirmation...</div>}>
      <ConfirmClient />
    </Suspense>
  )
}
