// File: app/signup/page.tsx
import { Suspense } from 'react'
import SignupClient from './SignupClient'

// ✅ This is a valid App Router pattern: read searchParams server-side
export default function SignupPage({ searchParams }: { searchParams: { plan?: string } }) {
  const selectedPlan = (searchParams.plan || 'free').toLowerCase()

  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading signup form...</div>}>
      <SignupClient plan={selectedPlan} />
    </Suspense>
  )
}
