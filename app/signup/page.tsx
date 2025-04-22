'use client';

import React, { Suspense } from 'react';
import SignUpForm from './SignUpForm'; // ✅ Correct path, relative import

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2daaff] to-[#1e90ff] flex items-center justify-center p-6">
      <Suspense fallback={<p className="text-white text-xl">Loading signup form...</p>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
