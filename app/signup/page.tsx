import { Suspense } from 'react'
import SignupClient from './SignupClient'

type SearchParams = { plan?: string | string[] }

export default function SignupPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const rawPlan = searchParams?.plan ?? 'free'
  const selectedPlan = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan

  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading signup form...</div>}>
      <SignupClient plan={selectedPlan.toLowerCase()} />
    </Suspense>
  )
}
