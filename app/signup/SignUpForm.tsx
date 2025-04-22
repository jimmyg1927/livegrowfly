'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [plan, setPlan] = useState<string>('free');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selectedPlan = searchParams.get('plan');
    if (selectedPlan) setPlan(selectedPlan);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, password, confirmPassword } = form;

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 10 || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      setError('Password must be at least 10 characters and include a number and special character.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, subscriptionType: plan }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Sign-up failed');

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2daaff] to-[#1e90ff] p-6">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md transition transform hover:scale-105">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">🚀 Join Growfly Today</h1>
        <p className="text-center text-gray-500 mb-4">Plan: <span className="font-semibold">{plan.toUpperCase()}</span></p>

        <form onSubmit={handleSignUp} className="space-y-5">
          <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#2daaff] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
