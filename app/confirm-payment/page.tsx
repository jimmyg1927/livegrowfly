'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) {
      setError('Missing search parameters.');
      setLoading(false);
      return;
    }

    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('Missing session ID.');
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/confirm-payment?session_id=${sessionId}`,
        );
        const data = await res.json();

        if (data.token) {
          localStorage.setItem('growfly_jwt', data.token);
          router.push('/dashboard');
          toast.success(`🎉 You're all set! Welcome aboard, nerd hero.`);
        } else {
          setError('Failed to confirm payment.');
        }
      } catch (err) {
        setError('Error confirming payment.');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-blue-600">
        <p>Processing your payment... please wait 🚀</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return null;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-blue-600">
          Loading...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
