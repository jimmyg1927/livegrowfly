'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.message) {
      setError('All fields are required.');
      return;
    }

    // This should send to backend email or db (placeholder for now)
    console.log('📬 Message submitted:', form);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#2daaff] flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-black text-center mb-6">📩 Contact Us</h1>
        {submitted ? (
          <p className="text-green-600 text-center text-lg font-semibold">
            ✅ Message sent! We’ll get back to you shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded px-4 py-2"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full border border-gray-300 rounded px-4 py-2"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Tell us more about your enterprise needs..."
              className="w-full border border-gray-300 rounded px-4 py-2 h-32"
              value={form.message}
              onChange={handleChange}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#2daaff] text-white py-2 px-4 rounded font-semibold hover:bg-blue-600 transition"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
