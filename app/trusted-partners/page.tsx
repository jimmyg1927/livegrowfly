'use client'

import React from 'react'
import Header from '../../src/components/Header'

export default function TrustedPartnersPage() {
  return (
    <div className="space-y-6">
      <Header />

      <div className="bg-card rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-primary">Trusted Partners (Coming Soon)</h2>

        <p className="text-base text-muted">
          We're working on creating a <strong>Trusted Partners</strong> page, bringing our Growfly Community the most trusted, discounted professional services for those times when technology or AI can't help you.
        </p>

        <ul className="list-disc pl-6 text-muted space-y-1">
          <li>Need a videographer?</li>
          <li>An accountant to check over your finances?</li>
          <li>A manufacturer to create your prototype?</li>
        </ul>

        <p className="text-base text-muted">
          We’ll be able to help you — <strong>check back soon</strong> for our new Trusted Partner Hub.
        </p>
      </div>
    </div>
  )
}
