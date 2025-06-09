'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, Crown, Zap, Users, Shield } from 'lucide-react'

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
    name: 'Free',
    price: '£0',
    period: '',
    icon: Zap,
    features: [
      '20 AI prompts per month',
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
    name: 'Personal',
    price: '£8.99',
    period: '/month',
    icon: Crown,
    features: [
      '400 AI prompts per month',
      'Advanced AI model access',
      'AI brand strategy generator',
      'Save unlimited prompts',
      'Export responses to PDF',
      'Priority support',
    ],
    button: 'Upgrade to Personal',
    popular: false,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'business',
    name: 'Business',
    price: '£38.99',
    period: '/month',
    icon: Users,
    features: [
      '2000 AI prompts per month',
      'Premium AI models (GPT-4, Claude)',
      'Multi-user team collaboration',
      'Advanced analytics dashboard',
      'Team prompt library',
      'Priority chat support',
      'Custom integrations',
    ],
    button: 'Upgrade to Business',
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
      'Unlimited AI prompts',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom AI model training',
      'Advanced security features',
      'Custom integrations & API',
      'SLA guarantee',
      'White-label options',
    ],
    button: 'Contact Sales',
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
      setMessage('To downgrade to free, please contact support to cancel your subscription.')
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
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-slate-300 text-sm">Loading your plan information...</p>
        </div>
      </main>
    )
  }

  // ✅ Early return if user is not loaded yet
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-slate-300 text-sm">Loading user information...</p>
        </div>
      </main>
    )
  }

  // ✅ Now we know user is not null, so we can safely use it
  const effectiveSubscription = getEffectiveSubscription(user)
  const hasValidSub = hasValidSubscription(user)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
            Scale your AI-powered growth with the perfect plan for your needs
          </p>
          
          {/* ✅ Current Plan Status */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className={`w-3 h-3 rounded-full ${hasValidSub ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white font-medium">
              Current Plan: {effectiveSubscription.charAt(0).toUpperCase() + effectiveSubscription.slice(1)}
              {!hasValidSub && effectiveSubscription !== 'free' && (
                <span className="text-red-400 ml-2">(Payment Required)</span>
              )}
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  {/* Plan Card */}
                  <div
                    className={`relative h-full flex flex-col rounded-2xl p-6 transition-all duration-300 border backdrop-blur-sm ${
                      plan.popular
                        ? 'bg-gradient-to-b from-white/20 to-white/10 border-yellow-400/50 shadow-2xl shadow-yellow-500/20'
                        : isCurrentPlan
                        ? 'bg-gradient-to-b from-green-500/20 to-green-600/10 border-green-400/50 shadow-xl shadow-green-500/20'
                        : 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/15'
                    } group-hover:transform group-hover:scale-[1.02]`}
                  >
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} text-white mb-3`}>
                        <PlanIcon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-white">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-white/60 text-sm ml-1">{plan.period}</span>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="flex-1 mb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-0.5">
                              <Check size={12} className="text-white" />
                            </div>
                            <span className="text-white/90 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelect(plan.id)}
                      disabled={selectedPlan === plan.id || isCurrentPlan}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isCurrentPlan
                          ? 'bg-green-500/20 text-green-300 border-2 border-green-400/50 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : canUpgrade
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-white/10 text-white/60 border border-white/20 cursor-not-allowed'
                      }`}
                    >
                      {selectedPlan === plan.id ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
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
        </div>

        {/* Message Display */}
        {message && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
              message.includes('Unable') || message.includes('Failed')
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}>
              <p className="font-medium text-center">{message}</p>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Why Upgrade?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-white mb-2">More Prompts</h4>
                <p className="text-white/70 text-sm">Get 20x more AI prompts to power your growth</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-white mb-2">Team Collaboration</h4>
                <p className="text-white/70 text-sm">Work together with your team seamlessly</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Crown className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-white mb-2">Premium Features</h4>
                <p className="text-white/70 text-sm">Access advanced AI models and analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-white/60 text-sm">
            Need help choosing? <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact our team</a> for personalized recommendations.
          </p>
        </div>
      </div>
    </main>
  )
}