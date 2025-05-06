'use client'

import React, { useState, useMemo } from 'react'
import { HiClipboard, HiCheckCircle } from 'react-icons/hi'
import { motion } from 'framer-motion'

const prompts = {
  'Marketing & Branding': [
    'How can you help me today?',
    'Write 3 Instagram captions for a vegan skincare brand.',
    'Create a slogan for a new eco shoe startup.',
    'Give me 10 newsletter subject lines for a spring sale.',
    'Explain how to position a personal brand for freelancers.',
    'Suggest ways to improve my brand tone of voice.',
    'Create a short USP for a luxury hair salon.',
  ],
  'Content Creation': [
    'Summarise this blog post into 5 LinkedIn bullet points.',
    'Write a script for a TikTok product demo.',
    'Turn this feature list into a benefits-driven landing page.',
    'Generate FAQ content for my homepage.',
    'Give me ideas for a 5-part YouTube series on productivity.',
    'Write a poll question for Instagram Stories.',
  ],
  'Entrepreneurship & Strategy': [
    'Give me a SWOT analysis for a startup selling cold brew.',
    'List 10 revenue streams for a digital product business.',
    'Validate my business idea with 3 quick tests.',
    'How do I pitch a new idea to investors in 3 sentences?',
    'Suggest 3 new niches I could target based on my skills.',
    'Build a 5-step go-to-market strategy.',
  ],
  'Finance & Budgeting': [
    'Help me build a simple monthly budget.',
    'What tools help track receipts and invoices?',
    'How do I handle taxes as a UK freelancer?',
    'List key expenses for a content creation business.',
    'Create a simple pricing model for digital services.',
  ],
  'Productivity & Planning': [
    'Help me make a launch to-do list.',
    'What should I do first when building a new product?',
    'Turn this vague goal into clear steps.',
    'Give me a weekly content calendar template.',
    'How do I stay consistent as a solopreneur?',
  ],
  'Growfly Feature Demos': [
    'How do I use the Collab Zone to plan with teammates?',
    'Remind me what I saved recently in Saved Mode.',
    'Submit a feature idea in the Suggestion Zone.',
    'Explain how prompt usage limits work on Growfly.',
    'Can I rename saved responses?',
    'How does XP work on Growfly?',
  ],
}

const nerdLevels = [
  { level: 1, title: 'Curious Cat 🐱' },
  { level: 2, title: 'Nerdlet 🧠' },
  { level: 3, title: 'Prompt Prober 🔍' },
  { level: 4, title: 'Nerdboss 🚀' },
  { level: 5, title: 'Prompt Commander 🤹‍♂️' },
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
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
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
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <motion.h1 className="text-4xl font-bold mb-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        🧠 Nerdify Me!
      </motion.h1>
      <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-3xl">
        Growfly is your AI-powered marketing nerd. Ask questions, copy prompts, plan content, and share ideas with teammates using tools like the Collab Zone, Saved Mode, and Suggestion Zone. Whether you’re a solo founder, marketer, or team lead, Growfly will help you do more — faster, smarter, funnier.
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {nerdLevels.map(({ title, level }) => (
          <div
            key={level}
            className="bg-white/10 text-sm p-4 rounded-md border border-white/10 flex items-center justify-center text-center font-medium text-white"
          >
            {title}
          </div>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-3 text-blue-400">🔍 Explore Prompt Ideas</h2>
        <input
          type="text"
          placeholder="Search prompts…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        {Object.entries(filteredPrompts).map(([category, list]) => (
          <div key={category} className="mb-4">
            <button
              className={`w-full text-left font-semibold px-4 py-2 rounded-md flex justify-between items-center transition ${
                openSections[category] ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              onClick={() => toggleSection(category)}
            >
              <span>{category}</span>
              <span>{openSections[category] ? '−' : '+'}</span>
            </button>
            {openSections[category] && (
              <ul className="mt-2 space-y-2">
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
      </div>

      <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
        <h2 className="text-2xl font-semibold text-blue-400">📘 What Are These Zones?</h2>
        <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
          <p><strong>📂 Collab Zone</strong> — Work on AI-generated content with teammates, edit together, brainstorm ideas, and plan campaigns.</p>
          <p><strong>💾 Saved Mode</strong> — Store your best AI responses, name them, and revisit your work later.</p>
          <p><strong>💡 Suggestion Zone</strong> — Suggest new features, tools, or prompts you'd love Growfly to support. The most upvoted ideas get built.</p>
        </div>
      </div>
    </div>
  )
}
