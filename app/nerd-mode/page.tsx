'use client';

import React, { useState, useMemo } from 'react';
import { HiClipboard, HiCheckCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';

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
  'Finance & Budgeting': [
    'Help me set up a simple monthly budget for my small business.',
    'What expenses should I track as a freelancer or consultant?',
    'How do I create a basic profit and loss statement?',
    'Give me 3 tools for managing business finances and receipts.',
    'Explain how to estimate taxes owed as a UK sole trader.',
    'Write an invoice email template for a freelance gig.',
    'Help me forecast cash flow for a seasonal business.',
  ],
  'HR & Admin': [
    'Write an onboarding checklist for a new remote employee.',
    'Draft a professional out-of-office reply for holiday leave.',
    'Create a company-wide announcement about a policy change.',
    'How can I streamline recruitment using AI?',
    'Generate 3 ideas to boost internal staff engagement.',
  ],
  'Law & Legal': [
    'Summarise a GDPR privacy policy in simple language.',
    'What are the legal essentials for a UK online business?',
    'Draft a basic NDA agreement template.',
    'What clauses should a freelance contract include?',
    'Explain IP protection for a product concept.',
  ],
  'Product Dev & Design': [
    'Suggest a design sprint outline for a new mobile app.',
    'List 5 UX mistakes to avoid in onboarding flows.',
    'What are 3 great onboarding UX examples from SaaS tools?',
    'Write a product update changelog for a new release.',
    'How do I prioritise new features from user feedback?',
  ],
  'Business & Market Research': [
    'Give me a competitor comparison table for CRM tools.',
    'How do I find my market positioning in the beauty space?',
    'Generate 3 customer personas for a meal prep service.',
    'Suggest a pricing strategy for a new subscription app.',
    'What metrics matter most for B2B SaaS growth?',
  ],
};

const nerdLevels = [
  { level: 1, title: 'Curious Cat', emoji: '🐱' },
  { level: 2, title: 'Nerdlet', emoji: '🧠' },
  { level: 3, title: 'Prompt Prober', emoji: '🔍' },
  { level: 4, title: 'Nerdboss', emoji: '🚀' },
  { level: 5, title: 'Prompt Commander', emoji: '🤹‍♂️' },
];

export default function NerdModePage() {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 1500);
  };

  const toggleSection = (category: string) => {
    setOpenSections((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredPrompts = useMemo(() => {
    if (!searchTerm) return prompts;
    const lower = searchTerm.toLowerCase();
    const result: Record<string, string[]> = {};
    Object.entries(prompts).forEach(([category, list]) => {
      const filtered = list.filter((p) => p.toLowerCase().includes(lower));
      if (filtered.length) result[category] = filtered;
    });
    return result;
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 text-textPrimary">

      {/* WELCOME + USAGE EXAMPLES */}
      <section className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-2">👋 Welcome to the Growfly Learning Hub</h2>
        <p className="text-sm leading-relaxed">
          Whether you&apos;re just starting out or already scaling, this is your place to <strong>master Growfly AI</strong>.
        </p>
        <p className="mt-2 text-sm">
          <strong>🧠 Pro Tip:</strong> Fill out your <a href="/brand-settings" className="underline text-blue-600">Brand Settings</a> to tailor content to your brand and tone.
        </p>
        <ul className="list-disc ml-5 text-sm text-blue-900 dark:text-blue-100 mt-3 space-y-1">
          <li>Automate your next marketing campaign with one prompt.</li>
          <li>Summarise a PDF, blog post, or call transcript instantly.</li>
          <li>Turn a messy idea into a clean project roadmap.</li>
          <li>Generate 10 content ideas in under 10 seconds.</li>
        </ul>
      </section>

      {/* SEE IN ACTION */}
      <section className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold text-accent mb-4">✨ See Growfly in Action</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-md bg-muted/5">
            <p className="text-xs font-medium text-muted mb-1">Prompt:</p>
            <p className="text-sm font-semibold">“Write a welcome email for new customers.”</p>
            <p className="text-xs mt-2 text-muted">Response Preview:</p>
            <p className="text-sm italic text-muted">&quot;Hey there! We’re so excited you joined us...&quot;</p>
          </div>
          <div className="p-4 border border-border rounded-md bg-muted/5">
            <p className="text-xs font-medium text-muted mb-1">Prompt:</p>
            <p className="text-sm font-semibold">“Summarise this PDF contract.”</p>
            <p className="text-xs mt-2 text-muted">Response Preview:</p>
            <p className="text-sm italic text-muted">&quot;This contract covers three key points: 1) Ownership...&quot;</p>
          </div>
        </div>
      </section>

      {/* HOW TO TIPS */}
      <section>
        <h2 className="text-xl font-semibold text-accent mb-4">💡 How to Use Growfly Like a Pro</h2>
        <ul className="space-y-3 text-sm text-muted">
          <li>✅ <strong>Start with verbs:</strong> “Write”, “Generate”, “Summarise”, “Create”...</li>
          <li>🧠 <strong>Add context:</strong> “for Gen Z audience”, “for UK tax laws”, etc.</li>
          <li>⚡ <strong>Use Saved tab:</strong> Bookmark your best prompts for reuse later.</li>
          <li>📤 <strong>Upload files:</strong> Docs and images can be processed instantly.</li>
        </ul>
      </section>

      {/* WEEKLY CHALLENGE */}
      <section className="bg-muted/5 p-4 mt-10 rounded-md border border-dashed border-border">
        <h3 className="text-sm font-semibold text-accent mb-2">🎯 Nerd Challenge of the Week</h3>
        <p className="text-sm text-muted mb-2">Use one prompt from each category and earn bonus XP!</p>
        <a href="/dashboard" className="text-blue-600 underline text-sm">Start the challenge →</a>
      </section>

      {/* SEARCH */}
      <section>
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-input text-sm placeholder-muted text-textPrimary border border-input-border focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </section>

      {/* PROMPT LIBRARY */}
      <section>
        <h2 className="text-xl font-semibold text-accent mb-4">📚 Prompt Library</h2>
        {Object.entries(filteredPrompts).map(([category, list]) => (
          <div key={category} className="mb-6">
            <button
              className="w-full text-left font-medium bg-input px-4 py-2 rounded-md flex justify-between items-center hover:bg-highlight transition text-textPrimary"
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
                    className="flex items-center justify-between bg-blue-100 dark:bg-blue-700 px-4 py-2 rounded-md text-sm hover:bg-blue-600 hover:text-textPrimary transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span>{prompt}</span>
                    <button
                      onClick={() => handleCopy(prompt)}
                      className="ml-4 transition"
                      title="Copy prompt"
                    >
                      {copiedPrompt === prompt ? (
                        <HiCheckCircle className="h-5 w-5 text-textPrimary" />
                      ) : (
                        <HiClipboard className="h-5 w-5 text-blue-700 dark:text-textPrimary" />
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* XP LEVELS */}
      <section className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold text-accent mb-2">🎮 XP & Nerd Levels</h2>
        <p className="text-sm text-muted mb-4">
          Every prompt you use earns you XP. As your Nerd Level rises, you unlock credibility, bragging rights, and future features.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-sm">
          {nerdLevels.map(({ emoji, title }, i) => (
            <div key={i} className="bg-muted/10 rounded-lg py-4 px-2 border border-border">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-medium">{title}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
