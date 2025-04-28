'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const [email, setEmail] = useState(''); // Can auto-fill this if passed via query param
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('growfly_jwt', data.token);
        setSuccess(true);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-300 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black rounded-2xl shadow-lg p-8 max-w-md w-full"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">🔐 Set Your Password</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-4"
          required
        />

        <label className="block mb-2 font-semibold">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-4"
          required
        />

        <label className="block mb-2 font-semibold">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-6"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 rounded-xl transition"
        >
          Set Password & Continue
        </button>

        {success && (
          <p className="text-green-600 mt-4 text-center">✅ Password updated successfully!</p>
        )}
      </form>
    </div>
  );
}
