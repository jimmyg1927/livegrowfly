'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handleTokenFetch = async () => {
      if (!sessionId) {
        console.error('No session_id found in URL.');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/issue-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          router.push('/dashboard'); // 🚀 Redirect straight into the dashboard!
        } else {
          console.error('Failed to retrieve token:', data.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error during token fetch:', error);
      }
    };

    handleTokenFetch();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-300">
      <h1 className="text-3xl font-bold text-white">Processing your subscription...</h1>
    </div>
  );
}
