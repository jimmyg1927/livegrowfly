'use client'

import React from 'react'

export default function TrustedPartnersPage() {
  return (
    <div className="px-4 md:px-8 py-10 bg-background text-textPrimary min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-card text-textPrimary rounded-3xl p-8 shadow-xl border border-border space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            🤝 Trusted Partners (Coming Soon)
          </h2>

          <p className="text-sm md:text-base leading-relaxed">
            At Growfly, we believe that the smartest organisations don’t rely solely on AI — they combine it
            with expert human support. That’s why we’re building a new <strong>Trusted Partners Network</strong> to give you direct access to pre-vetted professionals who can help where AI stops.
          </p>

          <ul className="list-disc pl-5 text-sm md:text-base space-y-1">
            <li>Need a creative team for your next brand campaign?</li>
            <li>Want an accountant to double-check your financials?</li>
            <li>Looking for help with prototyping, manufacturing, or legal advice?</li>
          </ul>

          <p className="text-sm md:text-base leading-relaxed">
            The Trusted Partners hub will connect you to real humans who’ve been hand-picked for their 
            professionalism and reliability. It’s our way of extending Growfly’s mission: to <strong>empower business owners, teams, and creators</strong> with not just tools, but trusted allies.
          </p>

          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            🚀 <strong>Coming soon</strong>: You’ll be able to search by skill, browse recommendations, and seamlessly send your AI-generated ideas to the right human expert.
          </p>

          <div className="pt-2">
            <p className="text-sm italic text-muted-foreground">
              AI gets you 90% of the way there. Trusted humans can take you the rest of the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
