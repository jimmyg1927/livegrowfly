'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, X, Zap } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const handleSelect = (plan: string) => {
    if (plan === 'enterprise') {
      router.push('/contact?plan=enterprise')
    } else {
      router.push(`/onboarding?plan=${plan}`)
    }
  }

  const plans = [
    {
      name: 'Launch',
      id: 'free',
      subtitle: 'Perfect to get started',
      price: '£0',
      period: '/month',
      popular: false,
      features: [
        { text: '20 AI prompts per month', included: true },
        { text: 'Unique detailed responses', included: true },
        { text: 'Access to Saved + Collab', included: true },
        { text: 'Basic templates library', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
        { text: 'Custom integrations', included: false }
      ],
      buttonText: 'Start Free Now',
      highlight: false
    },
    {
      name: 'Fly',
      id: 'personal',
      subtitle: 'For small growing businesses',
      price: '£8.99',
      period: '/month',
      popular: true,
      features: [
        { text: '400 AI prompts per month', included: true },
        { text: 'Unique detailed responses', included: true },
        { text: 'Access to Saved + Collab', included: true },
        { text: 'Premium templates library', included: true },
        { text: 'Email support', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Priority support', included: false },
        { text: 'Custom integrations', included: false }
      ],
      buttonText: 'Start 7-Day Free Trial',
      highlight: true
    },
    {
      name: 'Orbit',
      id: 'business',
      subtitle: 'Advanced plan for teams',
      price: '£38.99',
      period: '/month',
      popular: false,
      features: [
        { text: '2000 AI prompts per month', included: true },
        { text: 'Multi-user collaboration', included: true },
        { text: 'Advanced AI responses', included: true },
        { text: 'Full templates library', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'Team management tools', included: true },
        { text: 'API access', included: true }
      ],
      buttonText: 'Start 14-Day Free Trial',
      highlight: false
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-6 text-white relative overflow-hidden">
      {/* Background decoration - matching onboarding */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <Image src="/growfly-logo.png" alt="Growfly Logo" width={140} height={40} />
        </div>

        {/* Title Section */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Let's grow your business
          </h1>
          <div className="text-lg text-gray-300 space-y-1">
            <p>Start for free. Upgrade or cancel anytime.</p>
            <p>No credit card required for Launch plan.</p>
          </div>
          

        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 shadow-2xl flex flex-col transition-all duration-200 hover:scale-105 ${
                plan.highlight
                  ? 'bg-white/15 backdrop-blur-sm border-2 border-purple-400/50 shadow-purple-500/20'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Zap size={12} />
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-purple-300' : 'text-white'}`}>
                  {plan.name}
                </h2>
                <p className="text-white/70 text-sm mb-4">{plan.subtitle}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/60 text-sm">{plan.period}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 mb-6">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-500 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelect(plan.id)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
                    : plan.id === 'free'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Need something custom?</h3>
            <p className="text-white/70 text-sm mb-4">
              Enterprise plans with custom integrations, dedicated support, and unlimited usage.
            </p>
            <Link 
              href="/contact?plan=enterprise" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Contact Sales
            </Link>
          </div>
        </div>



        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}