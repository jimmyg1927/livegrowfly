'use client'

import React, { useState, useEffect } from 'react'
import { 
  HiOutlineMail, 
  HiOutlineReply, 
  HiOutlineSparkles, 
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePaperAirplane
} from 'react-icons/hi'

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [showAIDraft, setShowAIDraft] = useState(false)
  const [typingEffect, setTypingEffect] = useState('')

  // Mock email data
  const mockEmails = [
    {
      id: 1,
      from: 'sarah.johnson@techstartup.com',
      subject: 'Proposal for Q2 Marketing Campaign',
      preview: 'Hi there! I hope this email finds you well. I wanted to reach out regarding...',
      time: '2 hours ago',
      content: `Hi there!

I hope this email finds you well. I wanted to reach out regarding the marketing campaign proposal we discussed last week. 

Could we schedule a meeting next Tuesday at 2pm to go over the details? I have some exciting ideas for the Q2 campaign that I think would be perfect for your brand.

Looking forward to hearing from you!

Best regards,
Sarah Johnson
Marketing Director`,
      aiResponse: `Hi Sarah,

Thank you for following up on our Q2 marketing campaign discussion. I'm excited to hear about your ideas!

Tuesday at 2pm works perfectly for me. I'll send you a calendar invite shortly.

In preparation for our meeting, could you please send over any initial concepts or materials you'd like to review? This will help us make the most of our time together.

Looking forward to our collaboration!

Best regards,`,
      detectedActions: [
        { type: 'meeting', text: 'Meeting next Tuesday at 2pm', icon: HiOutlineCalendar },
        { type: 'task', text: 'Send calendar invite', icon: HiOutlineCheckCircle },
        { type: 'task', text: 'Request campaign materials', icon: HiOutlineCheckCircle }
      ]
    },
    {
      id: 2,
      from: 'alex.chen@clientcorp.com',
      subject: 'Follow-up on Project Timeline',
      preview: 'Thanks for the update on the project. I have a few questions about...',
      time: '4 hours ago',
      content: `Thanks for the update on the project. I have a few questions about the timeline:

1. When do you expect the first deliverables?
2. Can we push the deadline to next month?
3. What's the status on the design mockups?

Please let me know your thoughts.

Best,
Alex Chen`,
      aiResponse: `Hi Alex,

Thank you for your questions about the project timeline. Here are the details:

1. First deliverables will be ready by Thursday this week
2. We can accommodate a deadline extension to next month - this will actually improve quality
3. Design mockups are 80% complete and will be included with Thursday's deliverables

I'll send you a detailed timeline update by tomorrow morning.

Best regards,`,
      detectedActions: [
        { type: 'task', text: 'Prepare first deliverables by Thursday', icon: HiOutlineCheckCircle },
        { type: 'task', text: 'Send detailed timeline update by tomorrow', icon: HiOutlineCheckCircle },
        { type: 'task', text: 'Complete design mockups', icon: HiOutlineCheckCircle }
      ]
    }
  ]

  const aiDraftText = mockEmails[selectedEmail].aiResponse

  // Typing effect for AI response
  useEffect(() => {
    if (showAIDraft) {
      setTypingEffect('')
      let i = 0
      const timer = setInterval(() => {
        if (i < aiDraftText.length) {
          setTypingEffect(aiDraftText.substring(0, i + 1))
          i++
        } else {
          clearInterval(timer)
        }
      }, 30)
      return () => clearInterval(timer)
    }
  }, [showAIDraft, aiDraftText])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 md:px-8 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <HiOutlineMail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Growfly Email Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered email companion that reads, understands, and drafts professional responses using your brand voice
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Coming Very Soon
          </div>
        </div>

        {/* Mock Email Interface */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">See It In Action</h2>
            <p className="text-blue-100">Here's how Growfly will transform your email workflow</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-0">
            {/* Email List */}
            <div className="lg:border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <div className="p-4 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiOutlineMail className="w-5 h-5" />
                  Inbox (2 new)
                </h3>
              </div>
              <div className="space-y-0">
                {mockEmails.map((email, index) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(index)}
                    className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 ${
                      selectedEmail === index ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {email.from}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{email.time}</span>
                    </div>
                    <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1 truncate">
                      {email.subject}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {email.preview}
                    </p>
                    <div className="flex items-center mt-2 gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">AI Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Content */}
            <div className="lg:col-span-2">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mockEmails[selectedEmail].subject}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAIDraft(!showAIDraft)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <HiOutlineSparkles className="w-4 h-4" />
                      {showAIDraft ? 'Hide' : 'Generate'} AI Response
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  From: {mockEmails[selectedEmail].from}
                </p>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                    {mockEmails[selectedEmail].content}
                  </pre>
                </div>

                {/* AI Response Section */}
                {showAIDraft && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <HiOutlineSparkles className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">AI-Generated Response</h4>
                        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full font-medium">
                          Using your brand voice
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans min-h-[120px]">
                          {typingEffect}
                          {typingEffect.length < aiDraftText.length && (
                            <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
                          )}
                        </pre>
                      </div>
                      
                      {typingEffect.length >= aiDraftText.length && (
                        <div className="flex gap-3 mt-4">
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            <HiOutlinePencil className="w-4 h-4" />
                            Edit Draft
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                            <HiOutlinePaperAirplane className="w-4 h-4" />
                            Send Email
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Detected Actions */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-5 h-5 text-yellow-600" />
                        Smart Actions Detected
                      </h4>
                      <div className="space-y-3">
                        {mockEmails[selectedEmail].detectedActions.map((action, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                            <action.icon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{action.text}</span>
                            <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors">
                              {action.type === 'meeting' ? 'Add to Calendar' : 'Add to To-Do'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineSparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI-Powered Responses</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Growfly reads your emails and generates professional responses using your unique brand voice and tone.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineCalendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Scheduling</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Automatically detect meeting requests and create calendar events with one click.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineCheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Action Extraction</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Automatically identify tasks and action items from emails and add them to your to-do lists.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Growfly Email Assistant Works</h2>
            <p className="text-blue-100 text-lg max-w-3xl mx-auto">
              A seamless workflow that turns your inbox into a productivity powerhouse
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Connect Your Email</h4>
              <p className="text-blue-100 text-sm">Securely link Gmail, Outlook, or other email providers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">AI Reads & Understands</h4>
              <p className="text-blue-100 text-sm">Growfly analyzes incoming emails and understands context</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Generate Response</h4>
              <p className="text-blue-100 text-sm">Creates professional drafts using your brand voice</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h4 className="font-semibold mb-2">Review & Send</h4>
              <p className="text-blue-100 text-sm">Edit if needed, then send with confidence</p>
            </div>
          </div>
        </div>

        {/* Launch Timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Development Progress</h2>
            <p className="text-gray-600 dark:text-gray-400">We're working hard to bring you this revolutionary email experience</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">AI Response Engine</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Brand voice integration and response generation - Complete</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <HiOutlineClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Email Provider Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gmail and Outlook connectivity - In Progress</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Smart Actions & Calendar</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatic task and meeting detection - Next</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow-lg">
                <HiOutlineSparkles className="w-5 h-5 mr-2" />
                Expected Launch: Next 2-3 Weeks
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
            <HiOutlineMail className="w-6 h-6 mr-3" />
            Get Ready for Email Revolution
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Your email workflow is about to get a major upgrade. Growfly Email Assistant will handle the heavy lifting while you focus on growing your business.
          </p>
        </div>
      </div>
    </div>
  )
}