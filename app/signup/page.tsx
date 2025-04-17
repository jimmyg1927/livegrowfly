'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/plans');
    } else {
      alert('Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#2daaff] text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Signup</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
