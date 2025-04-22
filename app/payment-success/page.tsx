'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) {
        setError('No session ID found.');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/payment-success?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Payment processing failed.');
        }

        // Store JWT token from backend response
        localStorage.setItem('token', data.token);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Something went wrong.');
      }
    };

    handlePaymentSuccess();
  }, [sessionId, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 text-green-700">
      <p>Processing your payment... please wait 🚀</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
