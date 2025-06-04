'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Search, ChevronDown, ChevronUp, Sparkles, Brain, Target, Upload, Bookmark, Trophy, Zap, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { level: 1, title: 'Curious Cat', emoji: '🐱', description: 'Just getting started!' },
  { level: 2, title: 'Nerdlet', emoji: '🧠', description: 'Learning the ropes' },
  { level: 3, title: 'Prompt Prober', emoji: '🔍', description: 'Getting serious' },
  { level: 4, title: 'Nerdboss', emoji: '🚀', description: 'Advanced user' },
  { level: 5, title: 'Prompt Commander', emoji: '🤹‍♂️', description: 'Master level!' },
];

const categoryIcons = {
  'Marketing & Branding': '📢',
  'Content Creation': '✍️',
  'Entrepreneurship & Strategy': '🚀',
  'Productivity & Planning': '📅',
  'Finance & Budgeting': '💰',
  'HR & Admin': '👥',
  'Law & Legal': '⚖️',
  'Product Dev & Design': '🎨',
  'Business & Market Research': '📊',
};

// Interactive Prompt Builder Component
function InteractivePromptBuilder() {
  const [selectedAction, setSelectedAction] = useState('Write');
  const [selectedContent, setSelectedContent] = useState('email');
  const [selectedAudience, setSelectedAudience] = useState('customers');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [context, setContext] = useState('');

  const actions = ['Write', 'Generate', 'Create', 'Summarise', 'Analyse'];
  const contentTypes = ['email', 'social media post', 'blog article', 'product description', 'strategy', 'presentation'];
  const audiences = ['customers', 'team members', 'investors', 'Gen Z audience', 'B2B clients', 'executives'];
  const tones = ['professional', 'casual', 'friendly', 'authoritative', 'creative', 'persuasive'];

  const generatedPrompt = `${selectedAction} a ${selectedTone} ${selectedContent} for ${selectedAudience}${context ? ` about ${context}` : ''}.`;

  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-300">
        Build the perfect prompt by selecting options below. Watch how each choice improves your results!
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
          <select 
            value={selectedAction} 
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
          <select 
            value={selectedContent} 
            onChange={(e) => setSelectedContent(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {contentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audience</label>
          <select 
            value={selectedAudience} 
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {audiences.map(audience => (
              <option key={audience} value={audience}>{audience}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tone</label>
          <select 
            value={selectedTone} 
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tones.map(tone => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Context (Optional)</label>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., our new product launch, Q4 results, holiday sale..."
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-5 border border-blue-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Generated Prompt:</h3>
          <button
            onClick={() => navigator.clipboard.writeText(generatedPrompt)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
        <p className="text-gray-800 dark:text-gray-200 font-medium bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
          &quot;{generatedPrompt}&quot;
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <strong className="text-green-800 dark:text-green-300">✅ Good:</strong>
          <p className="text-green-700 dark:text-green-400 mt-1">Specific action words, clear audience, defined tone</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <strong className="text-yellow-800 dark:text-yellow-300">⚡ Better:</strong>
          <p className="text-yellow-700 dark:text-yellow-400 mt-1">Adding context makes it more relevant and useful</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <strong className="text-purple-800 dark:text-purple-300">🚀 Best:</strong>
          <p className="text-purple-700 dark:text-purple-400 mt-1">Include examples or specific requirements</p>
        </div>
      </div>
    </div>
  );
}

// Use Case Scenarios Component
function UseCaseScenarios() {
  const [selectedRole, setSelectedRole] = useState('startup-founder');

  const scenarios = {
    'startup-founder': {
      title: '🚀 Startup Founder',
      morning: 'Review yesterday&apos;s metrics and plan today&apos;s priorities',
      tasks: [
        { time: '9:00 AM', task: 'Analyse user feedback', prompt: 'Summarise this user feedback into 3 key themes and suggest actionable improvements.' },
        { time: '10:30 AM', task: 'Investor update email', prompt: 'Write a monthly investor update highlighting our 40% user growth and new feature launches.' },
        { time: '2:00 PM', task: 'Product roadmap planning', prompt: 'Help me prioritise these 8 feature requests based on user impact and development effort.' },
        { time: '4:00 PM', task: 'Team all-hands prep', prompt: 'Create an engaging team meeting agenda covering Q3 wins and Q4 goals.' }
      ]
    },
    'marketing-manager': {
      title: '📢 Marketing Manager',
      morning: 'Check campaign performance and social media engagement',
      tasks: [
        { time: '9:00 AM', task: 'Campaign analysis', prompt: 'Analyse this Google Ads campaign data and suggest 3 optimisation strategies.' },
        { time: '11:00 AM', task: 'Content calendar', prompt: 'Create a 2-week Instagram content calendar for our sustainable fashion brand.' },
        { time: '1:00 PM', task: 'Email newsletter', prompt: 'Write a compelling newsletter about our new product launch for our 10k subscribers.' },
        { time: '3:30 PM', task: 'Competitor research', prompt: 'Summarise this competitor&apos;s marketing strategy and identify 3 opportunities for us.' }
      ]
    },
    'freelancer': {
      title: '💼 Freelance Consultant',
      morning: 'Client check-ins and project status updates',
      tasks: [
        { time: '9:00 AM', task: 'Proposal writing', prompt: 'Write a consulting proposal for a 3-month digital transformation project.' },
        { time: '11:30 AM', task: 'Client report', prompt: 'Create an executive summary of our website optimisation results for the client.' },
        { time: '2:00 PM', task: 'Invoice follow-up', prompt: 'Write a polite but firm follow-up email for an overdue invoice.' },
        { time: '4:00 PM', task: 'New client research', prompt: 'Research this company&apos;s industry challenges and create 5 consultation talking points.' }
      ]
    },
    'e-commerce-owner': {
      title: '🛍️ E-commerce Owner',
      morning: 'Check overnight sales and inventory levels',
      tasks: [
        { time: '9:00 AM', task: 'Product descriptions', prompt: 'Write 5 compelling product descriptions for our new winter collection.' },
        { time: '11:00 AM', task: 'Customer service', prompt: 'Draft a response to this customer complaint about delayed shipping.' },
        { time: '1:30 PM', task: 'Sales promotion', prompt: 'Create a Black Friday email campaign with urgency and social proof.' },
        { time: '3:30 PM', task: 'Supplier negotiation', prompt: 'Help me prepare talking points for negotiating better wholesale prices.' }
      ]
    }
  };

  const currentScenario = scenarios[selectedRole];

  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-300">
        See how different professionals use Growfly throughout their day. Click on any prompt to copy it!
      </p>
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(scenarios).map(([key, scenario]) => (
          <button
            key={key}
            onClick={() => setSelectedRole(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedRole === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {scenario.title}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{currentScenario.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{currentScenario.morning}</p>
        
        <div className="space-y-4">
          {currentScenario.tasks.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer group"
              onClick={() => navigator.clipboard.writeText(item.prompt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                      {item.time}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.task}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">&quot;{item.prompt}&quot;</p>
                </div>
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 ml-3 flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Pro Tip for {currentScenario.title.split(' ')[1]}s:</h4>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {selectedRole === 'startup-founder' && "Save successful prompts to your Saved tab and create templates for recurring tasks like investor updates and team communications."}
            {selectedRole === 'marketing-manager' && "Use Growfly&apos;s brand settings to maintain consistent voice across all campaigns and content creation."}
            {selectedRole === 'freelancer' && "Create a library of proposal templates and client communication drafts to speed up your workflow."}
            {selectedRole === 'e-commerce-owner' && "Batch similar tasks like product descriptions together, and use seasonal prompts for holiday campaigns."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NerdModePage() {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🎓 Growfly Learning Hub
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Master AI-powered growth with our comprehensive prompt library. From marketing campaigns to financial planning, 
              we&apos;ve got the prompts that turn your ideas into results.
            </p>
          </motion.div>
        </div>

        {/* Welcome Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Growth Journey</h2>
              <p className="text-blue-100 mb-4 leading-relaxed">
                Whether you&apos;re launching your first startup or scaling an enterprise, this hub contains battle-tested prompts 
                that have helped thousands of entrepreneurs accelerate their growth.
              </p>
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <p className="font-semibold mb-2">🧠 Pro Tip: Maximize your results</p>
                <p className="text-sm text-blue-100">
                  Fill out your <a href="/brand-settings" className="underline hover:text-white transition-colors">Brand Settings</a> to get personalized content that matches your brand voice and industry.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Automate marketing campaigns with one prompt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Summarise PDFs and documents instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Turn messy ideas into clear roadmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Generate 10 content ideas in seconds</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Interactive Prompt Builder */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🛠️ Interactive Prompt Builder</h2>
          </div>
          
          <InteractivePromptBuilder />
        </motion.section>

        {/* Use Case Scenarios */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">💼 Day-in-the-Life Scenarios</h2>
          </div>
          
          <UseCaseScenarios />
        </motion.section>

        {/* Pro Tips */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Use Growfly Like a Pro</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Start with Action Verbs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Begin prompts with &quot;Write&quot;, &quot;Generate&quot;, &quot;Summarise&quot;, &quot;Create&quot;, &quot;Analyse&quot; for better results</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Add Specific Context</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Include details like &quot;for Gen Z audience&quot;, &quot;for UK tax laws&quot;, &quot;B2B SaaS company&quot;</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Use the Saved Tab</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bookmark your best-performing prompts for quick reuse and iteration</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Upload Files for Context</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">PDFs, documents, and images can be processed instantly for better analysis</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Weekly Challenge */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">🎯 Nerd Challenge of the Week</h3>
                <p className="text-purple-100">Use one prompt from each category and earn bonus XP points!</p>
              </div>
            </div>
            <a 
              href="/dashboard" 
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Start Challenge →
            </a>
          </div>
        </motion.section>

        {/* Search */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search prompts across all categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200"
            />
          </div>
        </motion.section>

        {/* Prompt Library */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📚 Prompt Library</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({Object.values(filteredPrompts).reduce((acc, arr) => acc + arr.length, 0)} prompts)
            </span>
          </div>
          
          <div className="space-y-4">
            {Object.entries(filteredPrompts).map(([category, list]) => (
              <motion.div 
                key={category} 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  onClick={() => toggleSection(category)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcons[category]}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{category}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{list.length} prompts available</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-600">
                    {openSections[category] ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openSections[category] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-slate-700"
                    >
                      <div className="p-5 bg-gray-50 dark:bg-slate-700/50">
                        <div className="grid gap-3">
                          {list.map((prompt, index) => (
                            <motion.div
                              key={prompt}
                              className="flex items-start justify-between bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <div className="flex-1 pr-4">
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{prompt}</p>
                              </div>
                              <button
                                onClick={() => handleCopy(prompt)}
                                className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                                  copiedPrompt === prompt
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                                title="Copy prompt"
                              >
                                {copiedPrompt === prompt ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* XP Levels */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🎮 XP & Nerd Levels</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Every prompt you use earns you XP points. As your Nerd Level rises, you unlock credibility, bragging rights, 
            and exclusive features. Climb the ranks and become a Prompt Commander!
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {nerdLevels.map(({ emoji, title, description }, i) => (
              <motion.div 
                key={i} 
                className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <div className="font-bold text-gray-900 dark:text-white mb-1">{title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
                <div className="mt-3 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (i + 1) * 20)}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}