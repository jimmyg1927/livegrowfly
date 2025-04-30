'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../src/components/Header';

export default function ReferPage() {
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.referralCode) setCode(data.referralCode);
      });
  }, []);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${code}`;

  return (
    <div className="space-y-6">
      <Header name="Refer a Friend" />

      <div className="bg-card rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Refer a Friend</h2>
        <p>Give a friend 10 free prompts, earn 5 credits for each signup.</p>

        <div className="flex items-center space-x-2">
          <code className="bg-background px-3 py-1 rounded font-mono">{code || '—'}</code>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="bg-accent text-background px-4 py-1 rounded hover:bg-accent/90 transition text-sm"
          >
            Copy Code
          </button>
        </div>

        <div>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            Share this link
          </a>
        </div>
      </div>
    </div>
  );
}
