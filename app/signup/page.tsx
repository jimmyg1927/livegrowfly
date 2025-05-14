// File: app/signup/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// ✅ Do NOT use `export const dynamic` here — `ssr: false` already disables prerendering
const SignupClient = dynamic(() => import('./SignupClient'), { ssr: false })

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading signup form...</div>}>
      <SignupClient />
    </Suspense>
  )
}
