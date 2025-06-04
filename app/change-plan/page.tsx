'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: '',
    features: [
      '20 AI prompts per month',
      'Basic AI model access',
      'Save your responses',
      'Collab Zone community access',
      'Basic prompt templates',
    ],
    button: 'Use Free',
    popular: false,
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '£8.99',
    period: '/month',
    features: [
      '400 AI prompts per month',
      'Advanced AI model access',
      'AI brand strategy generator',
      'Save unlimited prompts',
      'Priority email support',
      'Export responses to PDF',
      'Custom prompt templates',
    ],
    button: 'Change to Personal',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99',
    period: '/month',
    features: [
      '2000 AI prompts per month',
      'Premium AI models (GPT-4, Claude)',
      'Multi-user team collaboration',
      'Advanced analytics dashboard',
      'Team prompt library',
      'API access for integrations',
      'Priority chat support',
      'Custom branding options',
    ],
    button: 'Change to Business',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited AI prompts',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom AI model training',
      'Advanced security features',
      'Custom integrations & API',
      'SLA guarantees',
      'On-premise deployment option',
    ],
    button: 'Contact Us',
    popular: false,
  },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('growfly_jwt')
    if (!storedToken) {
      router.push('/login')
      return
    }
    
    setToken(storedToken)
    
    // Fetch current user plan using full API URL
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user data')
        return res.json()
      })
      .then((data) => {
        if (data?.subscriptionType) {
          setCurrentPlan(data.subscriptionType.toLowerCase())
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error)
        setMessage('Unable to load current plan information.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

  const handleSelect = async (planId: string) => {
    if (!token) {
      router.push('/login')
      return
    }

    setSelectedPlan(planId)
    setMessage('')

    if (planId === 'free') {
      router.push('/dashboard')
      return
    }

    if (planId === 'enterprise') {
      router.push('/contact')
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      
      if (data?.url) {
        window.location.href = data.url
      } else {
        setMessage(data.error || 'Failed to initiate plan change.')
        setSelectedPlan(null)
      }
    } catch (err) {
      console.error('Plan change error:', err)
      setMessage('Unable to process plan change. Please try again.')
      setSelectedPlan(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-slate-300 text-sm">Loading your plan information...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 px-4 py-6">
      {/* Header Section - Much Smaller */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Change Your Plan
        </h1>
        <p className="text-base text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">
          You&apos;re in complete control. Upgrade or downgrade anytime with no hidden fees.
        </p>
      </div>

      {/* Plans Grid - Optimized for All Screen Sizes */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative group ${
                plan.popular 
                  ? 'order-first sm:order-none lg:order-none' 
                  : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              {/* Plan Card - Smaller and More Compact */}
              <div
                className={`relative h-full flex flex-col rounded-2xl p-4 lg:p-6 transition-all duration-300 border shadow-lg ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-blue-400/50 shadow-2xl shadow-blue-500/25 lg:scale-105'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400/50 hover:shadow-xl'
                } group-hover:transform group-hover:scale-105`}
              >
                {/* Plan Header - Compact */}
                <div className="text-center mb-4 lg:mb-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className={`text-2xl lg:text-3xl font-bold ${
                      plan.popular ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base ml-1">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features List - More Compact */}
                <div className="flex-1 mb-4 lg:mb-6">
                  <ul className="space-y-2 lg:space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className={`flex-shrink-0 w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center mr-2 lg:mr-3 mt-0.5 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : 'bg-green-500'
                        }`}>
                          <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button - Compact */}
                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={selectedPlan === plan.id || currentPlan === plan.id}
                  className={`w-full py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl font-semibold text-xs lg:text-sm transition-all duration-200 transform ${
                    selectedPlan === plan.id
                      ? 'bg-gray-400 dark:bg-slate-600 text-gray-600 dark:text-slate-300 cursor-not-allowed'
                      : currentPlan === plan.id
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed border-2 border-gray-400 dark:border-slate-600'
                      : plan.popular
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-gray-500 dark:border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : (
                    plan.button
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className={`p-4 lg:p-6 rounded-2xl border backdrop-blur-sm ${
            message.includes('Unable') || message.includes('Failed')
              ? 'bg-red-500/10 border-red-500/30 text-red-400 dark:text-red-300'
              : 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-300'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 ${
                message.includes('Unable') || message.includes('Failed')
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`}>
                <svg className="w-3 h-3 text-white m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.includes('Unable') || message.includes('Failed') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
              </div>
              <p className="font-medium text-sm lg:text-base">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-4xl mx-auto text-center mt-8">
        <p className="text-gray-500 dark:text-slate-500 text-xs lg:text-sm">
          Need help choosing? Contact our support team for personalized recommendations.
        </p>
      </div>
    </main>
  )
}