// File: app/reset-password/page.tsx
import { Suspense } from 'react'
import ResetPasswordClient from '@/components/ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-textPrimary">Loading reset form...</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
