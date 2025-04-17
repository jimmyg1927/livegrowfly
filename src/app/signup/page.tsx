'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    const plan = sessionStorage.getItem('selectedPlan');
    if (!plan) router.push('/plans'); // force plan selection
    else setSelectedPlan(plan);
  }, []);

  function isStrongPassword(pw: string): boolean {
    return pw.length >= 10 && /[!@#$%^&*]/.test(pw) && /\d/.test(pw);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!isStrongPassword(password)) {
      return setError('Password must be at least 10 characters long, contain a number and a special character.');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Sign-up failed');

      localStorage.setItem('token', data.token);

      // redirect directly to billing
      router.push(`/shopify/billing?plan=${selectedPlan}&userId=${data.userId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-sm">
      <h1 className="text-2xl font-bold mb-4">Create Your Growfly Account</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Continue to Checkout
        </button>
      </form>
    </div>
  );
}
