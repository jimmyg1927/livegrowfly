// File: app/signup/page.tsx
import { Suspense } from 'react'
import SignupClient from './SignupClient'

// ✅ Correct typing for App Router page using searchParams
interface SignupPageProps {
  searchParams?: { plan?: string | string[] }
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  const selectedPlanRaw = searchParams?.plan ?? 'free'
  const selectedPlan = Array.isArray(selectedPlanRaw)
    ? selectedPlanRaw[0]
    : selectedPlanRaw

  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading signup form...</div>}>
      <SignupClient plan={selectedPlan.toLowerCase()} />
    </Suspense>
  )
}
