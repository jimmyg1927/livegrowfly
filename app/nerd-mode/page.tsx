'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Search, ChevronDown, ChevronUp, Sparkles, Brain, Target, Upload, Bookmark, Trophy, Zap, Users, Star, Globe, Heart, TrendingUp, FileText, Download, Save, MessageSquare, Lightbulb, Building2, Briefcase, PoundSterling } from 'lucide-react';
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
    'Write a LinkedIn thought leadership post about AI in business.',
    'Create a compelling About Us page for a sustainable fashion brand.',
  ],
  'Content Creation': [
    'Summarise this blog post into 5 bullet points for LinkedIn.',
    'Write a 60-second video script introducing our new feature.',
    'Turn this technical blog into something an intern would understand.',
    'Give me 3 newsletter intros that hook the reader.',
    'Create a tweet thread explaining our product in plain English.',
    'Generate FAQ content from a product spec sheet.',
    'Write a case study highlighting customer success.',
    'Create engaging social media captions for product launches.',
  ],
  'Entrepreneurship & Strategy': [
    'Give me a SWOT analysis for a streetwear clothing startup.',
    'Suggest 5 business names for a luxury home cleaning service.',
    'How can I validate my business idea quickly and cheaply?',
    'Write a mission statement for a tech-enabled dog-walking app.',
    'Help me plan a side hustle I can launch in 30 days.',
    'Create a competitive analysis for the meal delivery market.',
    'Draft a business model canvas for a SaaS startup.',
  ],
  'Productivity & Planning': [
    'Help me write a to-do list for launching my new product.',
    'Give me a weekly schedule for balancing work and side hustle.',
    'How do I stop procrastinating and get stuff done today?',
    'Build me a morning routine that fits my ADHD brain.',
    'Create a quarterly goal tracker for my startup.',
    'Design a project management workflow for remote teams.',
  ],
  'Finance & Budgeting': [
    'Help me set up a simple monthly budget for my small business.',
    'What expenses should I track as a freelancer or consultant?',
    'How do I create a basic profit and loss statement?',
    'Give me 3 tools for managing business finances and receipts.',
    'Explain how to estimate taxes owed as a UK sole trader.',
    'Write an invoice email template for a freelance gig.',
    'Help me forecast cash flow for a seasonal business.',
    'Create a financial dashboard for tracking KPIs.',
  ],
  'Compliance & Legal (Global)': [
    'Summarise GDPR privacy policy requirements in simple language.',
    'What are the legal essentials for a UK online business?',
    'Draft a basic NDA agreement template.',
    'What clauses should a freelance contract include?',
    'Explain IP protection for a product concept.',
    'Help me understand VAT registration requirements (UK/EU).',
    'Create a data protection impact assessment checklist.',
    'Write a professional redundancy consultation letter (UK law).',
  ],
  'HR & Admin': [
    'Write an onboarding checklist for a new remote employee.',
    'Draft a professional out-of-office reply for holiday leave.',
    'Create a company-wide announcement about a policy change.',
    'How can I streamline recruitment using AI?',
    'Generate 3 ideas to boost internal staff engagement.',
    'Write performance review templates for different roles.',
    'Create employee handbook sections for remote work.',
  ],
  'Product Dev & Design': [
    'Suggest a design sprint outline for a new mobile app.',
    'List 5 UX mistakes to avoid in onboarding flows.',
    'What are 3 great onboarding UX examples from SaaS tools?',
    'Write a product update changelog for a new release.',
    'How do I prioritise new features from user feedback?',
    'Create user personas for a B2B software product.',
  ],
  'Sales & Lead Generation': [
    'Write 5 cold email templates for SaaS outreach.',
    'Create a sales objection handling guide.',
    'Generate follow-up email sequences for prospects.',
    'Write compelling LinkedIn outreach messages.',
    'Create a lead qualification framework.',
    'Draft proposal templates for consulting services.',
  ],
  'Customer Service': [
    'Write empathetic responses to customer complaints.',
    'Create FAQ answers for common support queries.',
    'Draft refund policy explanations that maintain goodwill.',
    'Write escalation email templates for difficult situations.',
    'Create customer onboarding email sequences.',
  ],
  'Business & Market Research': [
    'Give me a competitor comparison table for CRM tools.',
    'How do I find my market positioning in the beauty space?',
    'Generate 3 customer personas for a meal prep service.',
    'Suggest a pricing strategy for a new subscription app.',
    'What metrics matter most for B2B SaaS growth?',
    'Create market research survey questions.',
    'Analyse industry trends for e-commerce businesses.',
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
  'Compliance & Legal (Global)': '⚖️',
  'HR & Admin': '👥',
  'Product Dev & Design': '🎨',
  'Sales & Lead Generation': '💼',
  'Customer Service': '🤝',
  'Business & Market Research': '📊',
};

// Enhanced Interactive Prompt Builder Component
function InteractivePromptBuilder() {
  const [selectedAction, setSelectedAction] = useState('Write');
  const [selectedContent, setSelectedContent] = useState('email');
  const [selectedAudience, setSelectedAudience] = useState('customers');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedIndustry, setSelectedIndustry] = useState('general');
  const [selectedUrgency, setSelectedUrgency] = useState('standard');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [context, setContext] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);

  const actions = ['Write', 'Generate', 'Create', 'Summarise', 'Analyse', 'Plan', 'Optimise'];
  const contentTypes = ['email', 'social media post', 'blog article', 'product description', 'strategy', 'presentation', 'proposal', 'case study', 'white paper', 'report', 'invoice template', 'contract'];
  const audiences = ['customers', 'team members', 'investors', 'Gen Z audience', 'B2B clients', 'executives', 'suppliers', 'stakeholders'];
  const tones = ['professional', 'casual', 'friendly', 'authoritative', 'creative', 'persuasive', 'empathetic', 'urgent'];
  const industries = ['general', 'technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'consulting', 'e-commerce', 'education', 'hospitality'];
  const urgencies = ['standard', 'urgent', 'high priority', 'time-sensitive'];
  const lengths = ['brief', 'medium', 'detailed', 'comprehensive'];

  const generatedPrompt = `${selectedAction} a ${selectedLength} ${selectedTone} ${selectedContent} for ${selectedAudience}${selectedIndustry !== 'general' ? ` in the ${selectedIndustry} industry` : ''}${selectedUrgency !== 'standard' ? ` (${selectedUrgency})` : ''}${context ? ` about ${context}` : ''}.`;

  const handleSaveTemplate = () => {
    setSavedTemplates(prev => [...prev, generatedPrompt]);
  };

  const handleExportPDF = () => {
    // In real implementation, this would generate a PDF
    console.log('Exporting prompt to PDF:', generatedPrompt);
  };

  return (
    <div className="space-y-5">
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        Build the perfect prompt by selecting options below. Watch how each choice improves your results!
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
          <select 
            value={selectedAction} 
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
          <select 
            value={selectedContent} 
            onChange={(e) => setSelectedContent(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {contentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Audience</label>
          <select 
            value={selectedAudience} 
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {audiences.map(audience => (
              <option key={audience} value={audience}>{audience}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tone</label>
          <select 
            value={selectedTone} 
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {tones.map(tone => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
          <select 
            value={selectedIndustry} 
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry === 'general' ? 'Any Industry' : industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Urgency</label>
          <select 
            value={selectedUrgency} 
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {urgencies.map(urgency => (
              <option key={urgency} value={urgency}>{urgency}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Length</label>
          <select 
            value={selectedLength} 
            onChange={(e) => setSelectedLength(e.target.value)}
            className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            {lengths.map(length => (
              <option key={length} value={length}>{length}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Context (Optional)</label>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., our new product launch, Q4 results, holiday sale..."
          className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-4 border border-blue-200 dark:border-slate-600 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Your Generated Prompt:</h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(generatedPrompt)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
            <button
              onClick={handleSaveTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-3 h-3" />
              PDF
            </button>
          </div>
        </div>
        <p className="text-gray-800 dark:text-gray-200 font-medium bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-600 text-sm">
          &quot;{generatedPrompt}&quot;
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-3">
          <strong className="text-green-800 dark:text-green-300">✅ Good:</strong>
          <p className="text-green-700 dark:text-green-400 mt-1">Specific action words, clear audience, defined tone</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3">
          <strong className="text-yellow-800 dark:text-yellow-300">⚡ Better:</strong>
          <p className="text-yellow-700 dark:text-yellow-400 mt-1">Adding context makes it more relevant and useful</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-3">
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
    <div className="space-y-5">
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        See how different professionals use Growfly throughout their day. Click on any prompt to copy it!
      </p>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(scenarios).map(([key, scenario]) => (
          <button
            key={key}
            onClick={() => setSelectedRole(key)}
            className={`px-3 py-2 rounded-2xl font-medium transition-all duration-200 text-sm ${
              selectedRole === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {scenario.title}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-5 border border-gray-200 dark:border-slate-600 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{currentScenario.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-5 text-sm">{currentScenario.morning}</p>
        
        <div className="space-y-3">
          {currentScenario.tasks.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
              onClick={() => navigator.clipboard.writeText(item.prompt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-xl">
                      {item.time}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.task}</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic">&quot;{item.prompt}&quot;</p>
                </div>
                <Copy className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colours duration-200 ml-3 flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-3">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">💡 Pro Tip for {currentScenario.title.split(' ')[1]}s:</h4>
          <p className="text-xs text-blue-800 dark:text-blue-300">
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
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Hero Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              🎓 Growfly Education Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Master AI-powered growth with our comprehensive prompt library. From marketing campaigns to financial planning, 
              we&apos;ve got the prompts that turn your ideas into results.
            </p>
          </motion.div>
        </div>

        {/* What is Growfly Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What is Growfly?</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
            Growfly is the world&apos;s first AI assistant built specifically for business growth. Unlike generic AI tools, 
            we understand your brand, learn your voice, and adapt to your industry.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">🎯 Brand-Specific Intelligence</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Learns your brand voice, values, and industry context. Remembers your business details across all conversations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">🌍 Built for Business Everywhere</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Deep knowledge of local regulations, tax laws, and business practices across different countries.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">🤝 We Work WITH You, Not AT You</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Continuous learning from your feedback. Your input shapes our AI development roadmap.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">📈 Business Growth Focused</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Every feature designed to help businesses grow. From sole traders to enterprises - we scale with you.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Our Mission Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-2xl">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold">🚀 Our Mission: Democratising Business AI</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-purple-100 mb-3 text-sm leading-relaxed">
                We believe every business, no matter how small, deserves access to enterprise-level AI assistance. 
                Growfly was created to level the playing field - giving sole traders the same AI superpowers as Fortune 500 companies.
              </p>
              <div className="bg-white/10 rounded-2xl p-3">
                <h4 className="font-semibold mb-2 text-sm">Why We Exist:</h4>
                <ul className="text-xs text-purple-100 space-y-1">
                  <li>• Make AI accessible to businesses of all sizes</li>
                  <li>• Bridge the gap between technical complexity and practical business needs</li>
                  <li>• Empower entrepreneurs to compete with larger competitors</li>
                </ul>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <h4 className="font-semibold mb-3 text-sm">🎯 Help Us Build the Future</h4>
              <p className="text-xs text-purple-100 mb-3">
                Your feedback shapes our roadmap. Every feature request, bug report, and suggestion helps us create the most powerful AI for businesses.
              </p>
              <a 
                href="/wishlist" 
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
              >
                <MessageSquare className="w-3 h-3" />
                Submit Ideas via Wishlist →
              </a>
            </div>
          </div>
        </motion.section>

        {/* Business Quick Wins Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">⚡ Business Quick Wins</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Ready-to-use prompts for common business tasks across different regions and industries.
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <PoundSterling className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">UK/EU Business</h4>
              </div>
              <div className="space-y-2 text-xs">
                <button 
                  onClick={() => handleCopy("Generate a professional invoice template with UK VAT requirements and payment terms.")}
                  className="w-full text-left text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colours duration-200"
                >
                  "Generate UK VAT invoice template →"
                </button>
                <button 
                  onClick={() => handleCopy("Write a GDPR-compliant privacy policy for a small e-commerce business.")}
                  className="w-full text-left text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colours duration-200"
                >
                  "Create GDPR privacy policy →"
                </button>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-3 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-300 text-sm">US Business</h4>
              </div>
              <div className="space-y-2 text-xs">
                <button 
                  onClick={() => handleCopy("Generate sales tax guidance for my US LLC across different states.")}
                  className="w-full text-left text-green-800 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400 transition-colours duration-200"
                >
                  "US sales tax guidance →"
                </button>
                <button 
                  onClick={() => handleCopy("Create employment handbook sections for US remote workers.")}
                  className="w-full text-left text-green-800 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400 transition-colours duration-200"
                >
                  "US employment handbook →"
                </button>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 text-sm">Global Business</h4>
              </div>
              <div className="space-y-2 text-xs">
                <button 
                  onClick={() => handleCopy("Create international payment terms for B2B contracts across multiple currencies.")}
                  className="w-full text-left text-purple-800 dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colours duration-200"
                >
                  "International payment terms →"
                </button>
                <button 
                  onClick={() => handleCopy("Generate cultural adaptation strategy for expanding into European markets.")}
                  className="w-full text-left text-purple-800 dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colours duration-200"
                >
                  "Market expansion strategy →"
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Interactive Prompt Builder */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🛠️ Interactive Prompt Builder</h2>
          </div>
          
          <InteractivePromptBuilder />
        </motion.section>

        {/* Use Case Scenarios */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">💼 Day-in-the-Life Scenarios</h2>
          </div>
          
          <UseCaseScenarios />
        </motion.section>

        {/* Pro Tips */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">How to Use Growfly Like a Pro</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Start with Action Verbs</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Begin prompts with &quot;Write&quot;, &quot;Generate&quot;, &quot;Summarise&quot;, &quot;Create&quot;, &quot;Analyse&quot; for better results</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Add Specific Context</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Include details like &quot;for Gen Z audience&quot;, &quot;for UK tax laws&quot;, &quot;B2B SaaS company&quot;</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Use the Saved Tab</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bookmark your best-performing prompts for quick reuse and iteration</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Upload className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Upload Files for Context</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">PDFs, documents, and images can be processed instantly for better analysis</p>
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
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-2xl">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold">🎯 Nerd Challenge of the Week</h3>
                <p className="text-purple-100 text-sm">Use one prompt from each category and earn bonus XP points!</p>
              </div>
            </div>
            <a 
              href="/dashboard" 
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl font-medium transition-all duration-200 hover:scale-105 text-sm"
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prompts across all categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200 text-sm"
            />
          </div>
        </motion.section>

        {/* Prompt Library */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-2xl">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">📚 Prompt Library</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({Object.values(filteredPrompts).reduce((acc, arr) => acc + arr.length, 0)} prompts)
            </span>
          </div>
          
          <div className="space-y-3">
            {Object.entries(filteredPrompts).map(([category, list]) => (
              <motion.div 
                key={category} 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colours duration-200"
                  onClick={() => toggleSection(category)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{categoryIcons[category]}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{category}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{list.length} prompts available</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-2xl bg-gray-100 dark:bg-slate-600">
                    {openSections[category] ? (
                      <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50">
                        <div className="grid gap-2">
                          {list.map((prompt, index) => (
                            <motion.div
                              key={prompt}
                              className="flex items-start justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <div className="flex-1 pr-3">
                                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{prompt}</p>
                              </div>
                              <button
                                onClick={() => handleCopy(prompt)}
                                className={`flex-shrink-0 p-2 rounded-2xl transition-all duration-200 ${
                                  copiedPrompt === prompt
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                                title="Copy prompt"
                              >
                                {copiedPrompt === prompt ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
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
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎮 XP & Nerd Levels</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed text-sm">
            Every prompt you use earns you XP points. As your Nerd Level rises, you unlock credibility, bragging rights, 
            and exclusive features. Climb the ranks and become a Prompt Commander!
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {nerdLevels.map(({ emoji, title, description }, i) => (
              <motion.div 
                key={i} 
                className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <div className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
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