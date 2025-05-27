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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#030712] to-[#1e3a8a] text-white flex items-center justify-center px-4 py-12">
      <div className="bg-white text-black p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-3 text-center text-[#1992FF]">
          + Let&apos;s talk about your business +
        </h1>
        <p className="text-center text-gray-600 mb-6">
          One of the Growfly founders will contact you shortly to discuss a bespoke enterprise package.
        </p>

        {submitted ? (
          <p className="text-green-600 text-center font-semibold">✅ Your message has been sent!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-semibold text-sm">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">What do you need from Growfly?</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#1992FF] text-white font-semibold py-3 rounded-xl hover:brightness-110 transition"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
