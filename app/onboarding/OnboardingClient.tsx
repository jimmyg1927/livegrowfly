'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle, XCircle, ArrowRight, ArrowLeft, Sparkles, Gift, Rocket } from 'lucide-react'
import { API_BASE_URL } from '@lib/constants'

type FormState = {
  name: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
  brandDescription: string
  brandVoice: string
  brandMission: string
  inspiredBy: string
  jobTitle: string
  industry: string
  goals: string
  referralCode: string
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  brandDescription: '',
  brandVoice: '',
  brandMission: '',
  inspiredBy: '',
  jobTitle: '',
  industry: '',
  goals: '',
  referralCode: '',
}

export default function OnboardingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams?.get('plan') ?? 'free'

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasReferralCode, setHasReferralCode] = useState(false)
  const submittingRef = useRef(false)

  // ✅ NEW: Capture referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const referralCode = urlParams.get('ref')
    if (referralCode) {
      setForm(prev => ({ ...prev, referralCode: referralCode.toUpperCase() }))
      setHasReferralCode(true)
      toast.success(`🎁 Referral code applied! You'll get 40 prompts to start with.`, {
        duration: 4000,
      })
    }
  }, [])

  useEffect(() => {
    const totalChars = Object.values(form).reduce((acc, val) => acc + val.trim().length, 0)
    setXp(Math.floor(totalChars * 0.05))
  }, [form])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const requiredFields: Record<number, (keyof FormState)[]> = {
    1: ['name', 'email', 'password', 'confirmPassword'],
    2: ['companyName', 'brandDescription', 'brandVoice', 'brandMission'],
    3: ['inspiredBy'],
    4: ['jobTitle', 'industry', 'goals'],
  }

  const validateStep = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    const fields = requiredFields[step]
    
    // Check required fields
    fields.forEach(field => {
      if (!form[field].trim()) {
        newErrors[field] = 'This field is required'
      }
    })
    
    // Password validation for step 1
    if (step === 1) {
      if (form.password && form.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('❌ Please fix the errors below.')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (submittingRef.current) return
    submittingRef.current = true

    if (!validateStep()) {
      submittingRef.current = false
      return
    }
    setLoading(true)

    try {
      // ✅ UPDATED: Include referral code in signup request
      const signupRes = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          jobTitle: form.jobTitle,
          industry: form.industry,
          ref: form.referralCode || undefined, // Include referral code if present
          plan, // This is now just for tracking intended plan
        }),
      })
      
      const signupData = await signupRes.json()
      
      if (signupRes.status === 409) {
        toast.error('❌ That email is already registered.')
        return
      }
      if (!signupRes.ok) throw new Error(signupData.error || 'Signup failed')

      const token = signupData.token
      localStorage.setItem('growfly_jwt', token)
      document.cookie = `growfly_jwt=${token}; path=/; max-age=604800`

      // Save brand settings
      const totalXP = xp
      const settingsRes = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brandName: form.companyName,
          brandDescription: form.brandDescription,
          brandVoice: form.brandVoice,
          brandMission: form.brandMission,
          inspiredBy: form.inspiredBy,
          jobTitle: form.jobTitle,
          industry: form.industry,
          goals: form.goals,
          totalXP,
          hasCompletedOnboarding: true,
        }),
      })
      if (!settingsRes.ok) throw new Error('Failed to save settings.')

      // Handle plan routing
      if (plan === 'free') {
        const welcomeMessage = hasReferralCode 
          ? '🎉 Welcome to Growfly! You have 40 prompts to get started!' 
          : '🎉 Welcome to Growfly!'
        toast.success(welcomeMessage)
        router.push('/dashboard')
      } else {
        // For paid plans, redirect to Stripe
        const stripeRes = await fetch(`${API_BASE_URL}/api/checkout/create-checkout-session`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId: plan }),
        })
        const { url } = await stripeRes.json()
        if (url) {
          window.location.href = url
        } else {
          throw new Error('Stripe session failed.')
        }
      }
    } catch (err: any) {
      toast.error(`❌ ${err.message || 'Error during onboarding.'}`)
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: '', color: '' }
    if (password.length < 8) return { strength: 'Too short', color: 'text-red-400' }
    if (password.length < 12) return { strength: 'Good', color: 'text-yellow-400' }
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return { strength: 'Very strong', color: 'text-green-400' }
    }
    return { strength: 'Strong', color: 'text-blue-400' }
  }

  const renderField = (
    label: string,
    name: keyof FormState,
    placeholder: string,
    textarea = false,
    type = 'text'
  ) => {
    const hasError = !!errors[name]
    const isPassword = type === 'password'
    const showPasswordToggle = isPassword && (name === 'password' || name === 'confirmPassword')
    const shouldShowPassword = (name === 'password' && showPassword) || (name === 'confirmPassword' && showConfirmPassword)
    const passwordStrength = name === 'password' ? getPasswordStrength(form[name]) : null

    return (
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-white">{label}</label>
        <div className="relative">
          {textarea ? (
            <textarea
              name={name}
              rows={2}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              className={`w-full bg-white/10 backdrop-blur-sm text-white border p-3 rounded-xl placeholder-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm ${
                hasError 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-white/30 hover:border-white/50'
              }`}
            />
          ) : (
            <input
              name={name}
              type={shouldShowPassword ? 'text' : type}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              className={`w-full bg-white/10 backdrop-blur-sm text-white border p-3 rounded-xl placeholder-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm ${
                hasError 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-white/30 hover:border-white/50'
              } ${showPasswordToggle ? 'pr-10' : ''}`}
            />
          )}
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => {
                if (name === 'password') setShowPassword(!showPassword)
                if (name === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1 rounded-xl hover:bg-white/10 focus:outline-none focus:bg-white/10"
            >
              {shouldShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        
        {passwordStrength && form[name] && (
          <p className={`text-xs font-medium ${passwordStrength.color}`}>
            {passwordStrength.strength}
          </p>
        )}
        
        {hasError && (
          <div className="flex items-center gap-1 text-red-400 text-xs">
            <XCircle size={12} />
            <span>{errors[name]}</span>
          </div>
        )}
      </div>
    )
  }

  const stepTitles = [
    { 
      title: "Let's set up your brand's growth engine", 
      subtitle: "This takes just 2–3 minutes — we promise it's worth it", 
      icon: '🚀' 
    },
    { 
      title: 'Teach us your brand — so we can think like it', 
      subtitle: 'Your answers here help Growfly write, plan, and strategise like it\'s on your team', 
      icon: '🏢' 
    },
    { 
      title: 'Who are your brand heroes, and what do they nail that you want to nail too?', 
      subtitle: 'Knowing who you rate helps us shape outputs that feel sharp, modern, and aligned with your vision', 
      icon: '✨' 
    },
    { 
      title: 'Final step! What do you really want to achieve?', 
      subtitle: 'Let\'s dig really deep. This is the cherry on top of personalising Growfly for your brand — so we can guide you toward the stuff that actually matters', 
      icon: '👤' 
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-3 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <Image src="/growfly-logo.png" alt="Growfly" width={120} height={32} />
            {plan !== 'free' && (
              <div className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold rounded-full">
                {plan.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Referral bonus banner */}
        {hasReferralCode && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gift className="text-green-400" size={16} />
                <span className="text-green-300 font-semibold text-sm">Referral Bonus Applied!</span>
              </div>
              <p className="text-green-200 text-xs">
                You'll start with <span className="font-bold">40 prompts</span> (20 free + 20 referral bonus)
              </p>
            </div>
          </div>
        )}

        {/* Progress and XP */}
        <div className="max-w-3xl mx-auto mb-4">
          <div className="text-center mb-3">
            <h1 className="text-xl md:text-2xl font-bold mb-1 leading-tight">{stepTitles[step - 1].title}</h1>
            <p className="text-white/80 text-sm leading-relaxed">{stepTitles[step - 1].subtitle}</p>
          </div>

          {/* XP Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Sparkles className="text-yellow-400" size={16} />
                <span className="text-xs font-semibold">{xp} XP</span>
              </div>
              <span className="text-xs text-white/60">More details = More XP!</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(xp, 100)}%` }}
              />
            </div>
          </div>

          {/* ✅ UPDATED: Step Navigation with Rounded Corners */}
          <div className="flex justify-center gap-2 mb-4">
            {stepTitles.map((stepInfo, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  step === i + 1
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : step > i + 1
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{stepInfo.icon}</span>
                <span className="hidden sm:inline">{i + 1}</span>
                {step > i + 1 && <CheckCircle size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-2xl">
            <div className="space-y-3">
              {step === 1 && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-white/90 text-sm">
                      Just a few questions so Growfly can write, plan, and think like it's already part of your team.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {renderField('Your name', 'name', 'Enter your full name')}
                    {renderField('Email address', 'email', 'your@email.com', false, 'email')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {renderField('Password', 'password', 'Create a strong password', false, 'password')}
                    {renderField('Confirm password', 'confirmPassword', 'Confirm your password', false, 'password')}
                  </div>

                  {/* ✅ NEW: Show referral code if applied */}
                  {hasReferralCode && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-400/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-300 text-xs font-semibold">Referral Code Applied</p>
                          <p className="text-green-200 text-xs">Code: {form.referralCode}</p>
                        </div>
                        <Gift className="text-green-400" size={20} />
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {step === 2 && (
                <>
                  {renderField('Brand/Company name', 'companyName', 'Your company or brand name')}
                  {renderField(
                    'Sum up your business in one or two killer sentences. No fluff.', 
                    'brandDescription', 
                    'e.g., "An independent coffee shop known for oat flat whites, clean branding, and a cult local following."', 
                    true
                  )}
                  {renderField(
                    'If your brand walked into a room, how would it act?', 
                    'brandVoice', 
                    'e.g., "Clean, sharp, and professional — gets to the point and doesn\'t waste words."', 
                    true
                  )}
                  {renderField(
                    'What are you building — and why does it matter?', 
                    'brandMission', 
                    'e.g., "To replace fast fashion with timeless, slow-designed pieces that actually last."', 
                    true
                  )}
                </>
              )}
              
              {step === 3 && (
                <>
                  {renderField(
                    'Which brands do you admire and why?', 
                    'inspiredBy', 
                    'Tell us about brands, companies, or competitors that inspire you and what they do well...', 
                    true
                  )}
                </>
              )}
              
              {step === 4 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {renderField('What\'s your role?', 'jobTitle', 'Marketing Director, Founder, etc.')}
                    {renderField('What industry are you in?', 'industry', 'Technology, Healthcare, Finance...')}
                  </div>
                  {renderField(
                    'Why have you decided to use Growfly?', 
                    'goals', 
                    'Be specific about what brought you here — increase sales, improve content, save time, grow audience...', 
                    true
                  )}
                </>
              )}
            </div>
          </div>

          {/* ✅ UPDATED: Navigation Buttons with Rounded Corners */}
          <div className="flex justify-between items-center mt-4">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-semibold text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div />
            )}
            
            {step < 4 ? (
              <button
                onClick={() => validateStep() && setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm ${
                  loading ? 'opacity-50 cursor-not-allowed transform-none' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    Launch Growfly
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white/60 text-xs">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline font-medium">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}