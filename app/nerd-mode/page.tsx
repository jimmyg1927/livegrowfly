'use client'

import React, { useState, useMemo } from 'react'
import { HiClipboard, HiCheckCircle } from 'react-icons/hi'
import { motion } from 'framer-motion'

const prompts = {
  'Marketing & Branding': [
    'Write 3 Instagram captions for a vegan skincare brand.',
    'Give me a killer headline for a spring sale email campaign.',
    'Explain how I can use storytelling to market my new app.',
    'List 5 ways to promote a business with no marketing budget.',
    'Create a content calendar for a fitness influencer.',
    'Generate 10 social ad variations for a back-to-school offer.',
    'What are 3 brand values for a startup aimed at Gen Z?',
  ],
  'Content Creation': [
    'Summarise this blog post into 5 bullet points for LinkedIn.',
    'Write a 60-second video script introducing our new feature.',
    'Turn this technical blog into something an intern would understand.',
    'Give me 3 newsletter intros that hook the reader.',
    'Create a tweet thread explaining our product in plain English.',
    'Generate FAQ content from a product spec sheet.',
  ],
  'Entrepreneurship & Strategy': [
    'Give me a SWOT analysis for a streetwear clothing startup.',
    'Suggest 5 business names for a luxury home cleaning service.',
    'How can I validate my business idea quickly and cheaply?',
    'Write a mission statement for a tech-enabled dog-walking app.',
    'Help me plan a side hustle I can launch in 30 days.',
  ],
  'Productivity & Planning': [
    'Help me write a to-do list for launching my new product.',
    'Give me a weekly schedule for balancing work and side hustle.',
    'How do I stop procrastinating and get stuff done today?',
    'Build me a morning routine that fits my ADHD brain.',
    'Create a quarterly goal tracker for my startup.',
  ],
  'Growfly Feature Demos': [
    'How do I use the Collab Zone to brainstorm with a teammate?',
    'Remind me what I saved in Saved Mode this week.',
    'Submit a new feature idea for Growfly’s Request Zone.',
    'How do I rename a saved response?',
    'How can I share a document from Collab Zone?',
  ],
  'Finance & Budgeting': [
    'Help me set up a simple monthly budget for my small business.',
    'What expenses should I track as a freelancer or consultant?',
    'How do I create a basic profit and loss statement?',
    'Give me 3 tools for managing business finances and receipts.',
    'Explain how to estimate taxes owed as a UK sole trader.',
    'Write an invoice email template for a freelance gig.',
    'Help me forecast cash flow for a seasonal business.',
  ],
}

const nerdLevels = [
  { level: 1, title: 'Curious Cat', emoji: '🐱' },
  { level: 2, title: 'Nerdlet', emoji: '🧠' },
  { level: 3, title: 'Prompt Prober', emoji: '🔍' },
  { level: 4, title: 'Nerdboss', emoji: '🚀' },
  { level: 5, title: 'Prompt Commander', emoji: '🤹‍♂️' },
]

export default function NerdModePage() {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(text)
    setTimeout(() => setCopiedPrompt(null), 1500)
  }

  const toggleSection = (category: string) => {
    setOpenSections((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const filteredPrompts = useMemo(() => {
    if (!searchTerm) return prompts
    const lower = searchTerm.toLowerCase()
    const result: Record<string, string[]> = {}
    Object.entries(prompts).forEach(([category, list]) => {
      const filtered = list.filter((p) => p.toLowerCase().includes(lower))
      if (filtered.length) result[category] = filtered
    })
    return result
  }, [searchTerm])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-white space-y-10">
      <motion.h1 className="text-4xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        🧠 Nerdify Me!
      </motion.h1>
      <p className="text-gray-300 text-lg max-w-3xl">
        Growfly is your marketing and productivity assistant. Built by nerds, to help you launch faster, write better, strategise smarter, and save time. Whether you're an entrepreneur, freelancer, or scaling company — we're here to help.
      </p>

      <section className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold text-blue-400 mb-2">🎮 Increase Your Nerd Level</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-sm">
          {nerdLevels.map(({ emoji, title }, i) => (
            <div key={i} className="bg-white/10 rounded-lg py-4 px-2 border border-white/10">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-medium text-white/90 text-sm">{title}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">📚 What’s Inside Growfly?</h2>
        <ul className="text-sm text-gray-300 space-y-2">
          <li><strong>Collab Zone</strong>: Work on shared documents with colleagues or clients in real-time.</li>
          <li><strong>Saved Mode</strong>: Save useful AI responses to reference or edit later.</li>
          <li><strong>Request Zone</strong>: Got ideas? Suggest features you’d love to see. The most upvoted ones go to our dev team!</li>
        </ul>
      </section>

      <section className="mb-4">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">📋 Prompt Library</h2>
        {Object.entries(filteredPrompts).map(([category, list]) => (
          <div key={category} className="mb-6">
            <button
              className="w-full text-left font-medium text-white bg-white/10 px-4 py-2 rounded-md flex justify-between items-center hover:bg-white/20 transition"
              onClick={() => toggleSection(category)}
            >
              <span>{category}</span>
              <span>{openSections[category] ? '−' : '+'}</span>
            </button>
            {openSections[category] && (
              <ul className="mt-3 space-y-2">
                {list.map((prompt) => (
                  <motion.li
                    key={prompt}
                    className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span>{prompt}</span>
                    <button
                      onClick={() => handleCopy(prompt)}
                      className="ml-4 text-white hover:text-green-400 transition"
                      title="Copy prompt"
                    >
                      {copiedPrompt === prompt ? (
                        <HiCheckCircle className="h-5 w-5" />
                      ) : (
                        <HiClipboard className="h-5 w-5" />
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold text-blue-400 mb-3">✨ Pro Tip</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Not sure where to start? Just type: <strong>How can you help me today?</strong> and let Growfly do the thinking.
        </p>
      </section>
    </div>
  )
}