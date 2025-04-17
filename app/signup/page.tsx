'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      if (!data.token) {
        throw new Error('Signup succeeded but no token received');
      }

      localStorage.setItem('token', data.token);
      router.push('/plans');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2daaff] text-white flex items-center justify-center px-4">
      <div className="bg-white text-black p-8 rounded-2xl shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Growfly Account</h1>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 rounded mb-5"
          placeholder="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-[#2daaff] text-white py-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
