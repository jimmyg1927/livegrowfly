import React from 'react';
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
    if (!plan) router.push('/plans');
    else setSelectedPlan(plan);
  }, [router]);

  function isStrongPassword(pw: string): boolean {
    return pw.length >= 10 && /[!@#$%^&*]/.test(pw) && /\d/.test(pw);
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      return setError('Please enter a valid email address.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!isStrongPassword(password)) {
      return setError('Password must be at least 10 characters, include a number and a special character.');
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

      // ✅ Redirect to backend billing endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/shopify/billing?plan=${selectedPlan}&userId=${data.userId}`;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  }

  return (
    <div className="min-h-screen bg-[#2daaff] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Create Your Growfly Account</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded text-sm"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border rounded text-sm"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-black text-white p-3 rounded hover:opacity-90 transition">
            Continue to Billing
          </button>
        </form>
      </div>
    </div>
  );
}
