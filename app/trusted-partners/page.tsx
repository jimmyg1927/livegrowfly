'use client';

import React from 'react';

export default function TrustedPartnersPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-[#1b1b1b] text-white rounded-2xl p-6 space-y-5 shadow-md">
        <h2 className="text-2xl font-bold">🤝 Trusted Partners (Coming Soon)</h2>
        <p className="text-sm text-muted">
          We're building a dedicated <strong>Trusted Partners</strong> network inside Growfly —
          so when AI can't solve your problem, our hand-picked professionals can.
        </p>

        <ul className="list-disc pl-5 text-sm space-y-1 text-muted">
          <li>Need a videographer or creative team?</li>
          <li>Want a qualified accountant to look over your finances?</li>
          <li>Looking for someone to help you prototype or manufacture?</li>
        </ul>

        <p className="text-sm text-muted">
          We’ve got you covered — <strong>check back soon</strong> to access your personalised support hub.
        </p>
      </div>
    </div>
  );
}
