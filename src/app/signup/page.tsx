'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handleTokenFetch = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/token-from-session`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          },
        );

        const data = await response.json();

        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          router.push('/dashboard'); // Redirect after login success
        } else {
          console.error('Failed to retrieve token:', data.error);
        }
      } catch (error) {
        console.error('Error during token fetch:', error);
      }
    };

    handleTokenFetch();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-300 text-white">
      <h1 className="text-3xl font-bold">Processing your subscription...</h1>
    </div>
  );
}
