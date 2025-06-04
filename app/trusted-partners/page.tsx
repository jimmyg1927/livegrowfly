'use client'

import React from 'react'

export default function TrustedPartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted Partners Network
          </h1>
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-200 dark:border-slate-700 space-y-8">
          
          {/* Vision Statement */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Where AI Meets Human Expertise
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              At Growfly, we believe that the smartest organisations don&apos;t rely solely on AI — they combine it
              with expert human support. That&apos;s why we&apos;re building a new <span className="font-semibold text-blue-600 dark:text-blue-400">Trusted Partners Network</span> to give you direct access to pre-vetted professionals who can help where AI stops.
            </p>
          </div>

          {/* Use Cases */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Creative Teams</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need a creative team for your next brand campaign?</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Financial Experts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Want an accountant to double-check your financials?</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Specialists</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Looking for help with prototyping, manufacturing, or legal advice?</p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-blue-100 leading-relaxed">
              The Trusted Partners hub will connect you to real humans who&apos;ve been hand-picked for their 
              professionalism and reliability. It&apos;s our way of extending Growfly&apos;s mission: to <span className="font-semibold text-white">empower business owners, teams, and creators</span> with not just tools, but trusted allies.
            </p>
          </div>

          {/* Development Status */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Development in Progress</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Our nerds are working hard to make this happen in the near future — another commitment to becoming the best tool for workers, business owners, and creators everywhere.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Coming soon</span>: You&apos;ll be able to search by skill, browse recommendations, and seamlessly send your AI-generated ideas to the right human expert.
                </p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="text-center pt-4">
            <blockquote className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-400 italic">
              &ldquo;AI gets you 90% of the way there. Trusted humans can take you the rest of the way.&rdquo;
            </blockquote>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <h3 className="font-bold text-gray-900 dark:text-white">Coming Soon</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;re putting the finishing touches on this exciting new feature. Stay tuned!
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              Smart Matching
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI-powered recommendations to match you with the perfect expert for your specific needs and budget.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">✅</span>
              </span>
              Verified Professionals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Every partner is thoroughly vetted for expertise, reliability, and professionalism before joining our network.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}