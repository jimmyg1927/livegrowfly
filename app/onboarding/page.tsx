'use client'

import React, { Suspense } from 'react'
import OnboardingClient from './OnboardingClient'

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="text-textPrimary p-10">Loading onboarding...</div>}>
      <OnboardingClient />
    </Suspense>
  )
}