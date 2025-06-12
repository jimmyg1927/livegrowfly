'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, X, Zap, Rocket, Plane, Crown } from 'lucide-react'

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
      icon: Rocket,
      popular: false,
      features: [
        { text: '20 AI text prompts per month', included: true },
        { text: '2 AI images daily (10 monthly)', included: true },
        { text: 'Basic AI model access', included: true },
        { text: 'Save your responses', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
        { text: 'Custom integrations', included: false }
      ],
      buttonText: 'Start Free Now',
      highlight: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Fly',
      id: 'personal',
      subtitle: 'For small growing businesses',
      price: '£8.99',
      period: '/month',
      icon: Plane,
      popular: true,
      features: [
        { text: '400 AI text prompts per month', included: true },
        { text: '10 AI images daily (50 monthly)', included: true },
        { text: 'Advanced AI model access', included: true },
        { text: 'AI brand strategy generator', included: true },
        { text: 'Export responses to PDF', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Priority support', included: false },
        { text: 'Custom integrations', included: false }
      ],
      buttonText: 'Start 7-Day Free Trial',
      highlight: true,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Orbit',
      id: 'business',
      subtitle: 'Advanced plan for teams',
      price: '£38.99',
      period: '/month',
      icon: Crown,
      popular: false,
      features: [
        { text: '2000 AI text prompts per month', included: true },
        { text: '30 AI images daily (150 monthly)', included: true },
        { text: 'Premium AI models (GPT-4, Claude)', included: true },
        { text: 'Multi-user team collaboration', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Team prompt library', included: true },
        { text: 'Priority chat support', included: true },
        { text: 'API access', included: true }
      ],
      buttonText: 'Start 14-Day Free Trial',
      highlight: false,
      color: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-4 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-center mb-4">
          <Image src="/growfly-logo.png" alt="Growfly Logo" width={120} height={35} />
        </div>

        {/* Title Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Let's grow your business
          </h1>
          <div className="text-sm text-white/80 space-y-1">
            <p>Start for free. Upgrade or cancel anytime.</p>
            <p>No credit card required for Launch plan.</p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {plans.map((plan) => {
            const PlanIcon = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-5 transition-all duration-300 backdrop-blur-sm ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-white/15 to-white/10 border-2 border-cyan-400/80 shadow-xl shadow-cyan-500/20'
                    : 'bg-white/10 border-2 border-cyan-400/50 hover:border-cyan-400/80 hover:bg-white/15'
                } hover:transform hover:scale-[1.02]`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Zap size={10} />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${plan.color} text-white mb-2`}>
                    <PlanIcon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    {plan.name}
                  </h2>
                  <p className="text-white/60 text-xs mb-2">{plan.subtitle}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60 text-xs ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1 mb-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mr-2 mt-0.5">
                            <Check size={10} className="text-white" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center mr-2 mt-0.5">
                            <X size={10} className="text-white" />
                          </div>
                        )}
                        <span className={`text-xs leading-relaxed ${feature.included ? 'text-white/90' : 'text-white/40'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelect(plan.id)}
                  className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-md hover:shadow-lg transform hover:scale-105'
                      : plan.id === 'free'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-300 hover:to-blue-400 shadow-md hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            )
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mb-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto border border-cyan-400/30">
            <h3 className="text-lg font-semibold mb-1 text-white">Need something custom?</h3>
            <p className="text-white/70 text-xs mb-3">
              Enterprise plans with custom integrations, dedicated support, and unlimited usage.
            </p>
            <Link 
              href="/contact?plan=enterprise" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-xs"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-white/60 text-xs">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}