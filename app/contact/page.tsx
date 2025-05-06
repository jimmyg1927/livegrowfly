'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Replace with your real backend endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      })

      if (res.ok) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setCompany('')
        setMessage('')
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (err) {
      alert('Error sending request.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-gray-900 text-white flex items-center justify-center px-4 py-12">
      <div className="bg-white text-black p-8 rounded-2xl shadow-2xl w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-2 text-center">📩 Contact Us</h1>
        <p className="text-center text-gray-600 mb-6">
          One of the Growfly founders will contact you shortly to discuss a bespoke package for you.
        </p>

        {submitted ? (
          <p className="text-green-600 text-center font-semibold">✅ Your message has been sent!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Tell us more about your enterprise needs</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
