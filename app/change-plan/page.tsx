'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, Crown, Zap, Users, Shield, Rocket, Plane } from 'lucide-react'

// ✅ Define User type inline to avoid import issues
interface User {
  id: string
  email: string
  name?: string
  subscriptionType: string
  promptsUsed: number
  promptLimit: number
  totalXP: number
  stripeCustomerId?: string | null
  billingStartDate?: Date | string | null
  
  // ✅ Image generation properties
  imagesGeneratedToday?: number
  imagesGeneratedThisMonth?: number
  lastImageGeneratedDate?: Date | string | null
  lastImageResetDate?: Date | string | null
  
  // ✅ Additional common properties
  hasCompletedOnboarding?: boolean
  isEnterprise?: boolean
  referralCode?: string | null
  referralCredits?: number
  usersAllowed?: number
  
  // ✅ Allow any additional properties from your actual user object
  [key: string]: any
}

// ✅ Helper functions for subscription validation
function hasValidSubscription(user: User | null | undefined): boolean {
  if (!user) return false
  if (user.subscriptionType === 'free') return true
  return !!(user.stripeCustomerId || user.billingStartDate)
}

function getEffectiveSubscription(user: User | null | undefined): string {
  if (!user) return 'free'
  return hasValidSubscription(user) ? user.subscriptionType : 'free'
}

const plans = [
  {
    id: 'free',
    name: 'Launch',
    price: '£0',
    period: '',
    icon: Rocket,
    features: [
      '20 AI text prompts per month',
      '2 AI images daily (10 monthly)',
      'Basic AI model access',
      'Save your responses',
      'Community support',
    ],
    button: 'Current Plan',
    popular: false,
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'personal',
    name: 'Fly',
    price: '£8.99',
    period: '/month',
    icon: Plane,
    features: [
      '400 AI text prompts per month',
      '10 AI images daily (50 monthly)',
      'Advanced AI model access',
      'AI brand strategy generator',
      'Save unlimited prompts',
      'Export responses to PDF',
      'Priority support',
    ],
    button: 'Upgrade to Fly',
    popular: false,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'business',
    name: 'Orbit',
    price: '£38.99',
    period: '/month',
    icon: Crown,
    features: [
      '2000 AI text prompts per month',
      '30 AI images daily (150 monthly)',
      'Premium AI models (GPT-4, Claude)',
      'Multi-user team collaboration',
      'Advanced analytics dashboard',
      'Team prompt library',
      'Priority chat support',
      'Custom integrations',
    ],
    button: 'Upgrade to Orbit',
    popular: true,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    icon: Shield,
    features: [
      'Unlimited AI prompts & images',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom AI model training',
      'Advanced security features',
      'Custom integrations & API',
      'SLA guarantee',
      'White-label options',
    ],
    button: 'Need Something Custom?',
    popular: false,
    color: 'from-amber-500 to-orange-600',
  },
]

export default function ChangePlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
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
    
    // Fetch current user plan
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user data')
        return res.json()
      })
      .then((userData) => {
        setUser(userData)
        // ✅ Use effective subscription instead of raw subscriptionType
        const effectivePlan = getEffectiveSubscription(userData)
        setCurrentPlan(effectivePlan.toLowerCase())
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
      // Can't downgrade to free directly, need to cancel subscription
      setMessage('To downgrade to Launch, please contact support to cancel your subscription.')
      setSelectedPlan(null)
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
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 text-sm">Loading your plan information...</p>
        </div>
      </main>
    )
  }

  // ✅ Early return if user is not loaded yet
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 text-sm">Loading user information...</p>
        </div>
      </main>
    )
  }

  // ✅ Now we know user is not null, so we can safely use it
  const effectiveSubscription = getEffectiveSubscription(user)
  const hasValidSub = hasValidSubscription(user)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-base text-white/80 max-w-2xl mx-auto mb-4">
            Scale your AI-powered growth with the perfect plan for your needs
          </p>
          
          {/* ✅ Current Plan Status */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-400/30">
            <div className={`w-2 h-2 rounded-full ${hasValidSub ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-sm font-medium">
              Current: {effectiveSubscription.charAt(0).toUpperCase() + effectiveSubscription.slice(1)}
              {!hasValidSub && effectiveSubscription !== 'free' && (
                <span className="text-red-400 ml-2">(Payment Required)</span>
              )}
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon
            const isCurrentPlan = currentPlan === plan.id
            const canUpgrade = plan.id !== 'free' && !isCurrentPlan
            
            return (
              <div
                key={plan.id}
                className={`relative group ${plan.popular ? 'lg:scale-105' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                {/* Plan Card */}
                <div
                  className={`relative h-full flex flex-col rounded-xl p-5 transition-all duration-300 backdrop-blur-sm ${
                    isCurrentPlan
                      ? 'bg-gradient-to-b from-cyan-500/20 to-cyan-600/10 border-2 border-cyan-400 shadow-xl shadow-cyan-500/20'
                      : plan.popular
                      ? 'bg-gradient-to-b from-white/15 to-white/10 border-2 border-cyan-400/80 shadow-xl shadow-cyan-500/20'
                      : 'bg-white/10 border-2 border-cyan-400/50 hover:border-cyan-400/80 hover:bg-white/15'
                  } group-hover:transform group-hover:scale-[1.02]`}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${plan.color} text-white mb-2`}>
                      <PlanIcon size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-2xl font-bold text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-white/60 text-xs ml-1">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 mb-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mr-2 mt-0.5">
                            <Check size={10} className="text-white" />
                          </div>
                          <span className="text-white/90 text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSelect(plan.id)}
                    disabled={selectedPlan === plan.id || isCurrentPlan}
                    className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : isCurrentPlan
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-md hover:shadow-lg transform hover:scale-105'
                        : canUpgrade
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-300 hover:to-blue-400 shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-white/10 text-white/60 border border-white/20 cursor-not-allowed'
                    }`}
                  >
                    {selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                        Processing...
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      plan.button
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message Display */}
        {message && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className={`p-4 rounded-xl border backdrop-blur-sm ${
              message.includes('Unable') || message.includes('Failed')
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}>
              <p className="text-sm text-center">{message}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Need help choosing? <a href="/contact" className="text-cyan-400 hover:text-cyan-300 underline">Contact our team</a> for personalized recommendations.
          </p>
        </div>
      </div>
    </main>
  )
}