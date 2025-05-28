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
        alert('❌ Failed to send message.')
      }
    } catch (err) {
      alert('❌ Error sending request.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030712] to-[#1e3a8a] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-2xl bg-[#0f172a] text-white rounded-2xl shadow-xl p-8 sm:p-10 border border-white/10">
        <div className="flex justify-center mb-6">
          <img src="/growfly.svg" alt="Growfly Logo" className="h-10 sm:h-12" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center text-[#1992FF]">
          Let’s talk about your business
        </h1>
        <p className="text-center text-white/80 mb-6 text-sm sm:text-base">
          Fill in this short form and one of our Growfly founders — <strong>Jimmy</strong> or <strong>Teddy</strong> — will personally reach out to you to tailor a solution for your business.
        </p>

        {submitted ? (
          <div className="text-green-400 text-center font-semibold">
            ✅ Thanks! We&apos;ll be in touch shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-sm text-white">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-white">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-white">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-white">What do you need from Growfly?</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1992FF]"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#1992FF] hover:bg-[#0f66c5] text-white font-semibold py-3 rounded-lg transition"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
