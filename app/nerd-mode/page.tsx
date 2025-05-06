'use client'

import React, { useState, useMemo } from 'react'
import { HiClipboard, HiCheckCircle, HiQuestionMarkCircle } from 'react-icons/hi'
import { motion } from 'framer-motion'

const prompts = {
  'Marketing & Branding': [
    'Write 3 Instagram captions for a vegan skincare brand.',
    'Give me a killer headline for a spring sale email campaign.',
    'Explain how I can use storytelling to market my new app.',
    'List 5 ways to promote a business with no marketing budget.',
  ],
  'Content Creation': [
    'Summarise this blog post into 5 bullet points for LinkedIn.',
    'Write a 60-second video script introducing our new feature.',
    'Turn this technical blog into something an intern would understand.',
  ],
  'Entrepreneurship & Strategy': [
    'Give me a SWOT analysis for a streetwear clothing startup.',
    'Suggest 5 business names for a luxury home cleaning service.',
    'How can I validate my business idea quickly and cheaply?',
  ],
  'Productivity & Planning': [
    'Help me write a to-do list for launching my new product.',
    'Give me a weekly schedule for balancing work and side hustle.',
    'How do I stop procrastinating and get stuff done today?',
  ],
  'Growfly Feature Demos': [
    'How do I use the Collab Zone to brainstorm with a teammate?',
    'Remind me what I saved in Saved Mode this week.',
    'Submit a new feature idea for Growfly’s Request Zone.',
  ],
  'Finance & Budgeting': [
    'Help me set up a simple monthly budget for my small business.',
    'What expenses should I track as a freelancer or consultant?',
    'How do I create a basic profit and loss statement?',
    'Give me 3 tools for managing business finances and receipts.',
    'Explain how to estimate taxes owed as a UK sole trader.',
  ],
}

const nerdLevels = [
  { level: 1, title: 'Just a lil curious', emoji: '🐱', tip: 'Send your first few prompts and explore the dashboard.' },
  { level: 2, title: 'Nerdlet', emoji: '🧠', tip: 'Save responses you like and remix them for new ideas.' },
  { level: 3, title: 'Prompt Prober', emoji: '🔍', tip: 'Try advanced prompts, collaborate with teammates, and build campaigns.' },
  { level: 4, title: 'Nerdboss', emoji: '🚀', tip: 'Use the Collab Zone like a planning board and get creative daily.' },
  { level: 5, title: 'Prompt Commander', emoji: '🤹‍♂️', tip: 'Master Growfly. Use Request Zone. Teach others.' },
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
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      <motion.h1 className="text-4xl font-bold mb-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        🧠 Nerdify Me!
      </motion.h1>
      <p className="text-lg text-gray-300 mb-8">
        Built by nerds, for you. Boost your IQ. Power up your ideas. Become unstoppable.
      </p>

      <section className="mb-10 bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold mb-4">🎮 Increase Your Nerd Level</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-200">
          {nerdLevels.map(({ level, title, emoji, tip }) => (
            <motion.div
              key={level}
              className="bg-white/10 p-4 rounded-md border border-white/10 hover:bg-white/20 transition"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-semibold mb-1">{emoji} {title}</div>
              <p>{tip}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-10 bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold mb-4">🥇 Guide to Becoming a Prompt Commander</h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
          <li><strong>Level 1: Just a lil curious (0–25 XP)</strong> — Send your first few prompts and explore the dashboard.</li>
          <li><strong>Level 2: Nerdlet (25–150 XP)</strong> — Save responses you like and remix them for new ideas.</li>
          <li><strong>Level 3: Prompt Prober (150–500 XP)</strong> — Try advanced prompts, collaborate with teammates, and build campaigns.</li>
          <li><strong>Level 4: Nerdboss (500–850 XP)</strong> — Use the Collab Zone like a planning board and get creative daily.</li>
          <li><strong>Level 5: Prompt Commander (850+ XP)</strong> — You’ve mastered Growfly. Now help shape it by using the Request Zone and teaching others.</li>
        </ul>
      </section>

      <section className="mb-6">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">📋 Prompt Library</h2>
        {Object.entries(filteredPrompts).map(([category, list]) => (
          <div key={category} className="mb-4">
            <button
              className="w-full text-left font-medium text-white bg-white/10 px-4 py-2 rounded-md flex justify-between items-center hover:bg-white/20 transition"
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
      </section>

      <section className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold mb-3">🚀 Still Unsure?</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Start small. Remix prompts. Save your ideas. Growfly is your creative sidekick — here to help you write, build, pitch, plan, and share.
        </p>
        <p className="mt-3 text-sm text-gray-300">
          Want Growfly to do something new? Tap the Request Zone and tell our nerds what to build next.
        </p>
      </section>
    </div>
  )
}
