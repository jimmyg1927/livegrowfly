'use client'

import React, { Suspense } from 'react'
import SignupClient from './SignupClient'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-textPrimary px-4 py-10">
      <Suspense fallback={<div className="text-center text-sm">Loading signup form…</div>}>
        <SignupClient />
      </Suspense>
    </main>
  )
}
