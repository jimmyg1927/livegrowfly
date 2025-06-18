'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, ChevronLeft, Star, Rocket, 
  Target, Brain, Palette, MessageCircle, Gift, Crown, Wand2, Play
} from 'lucide-react'

interface GrowflyTutorialProps {
  isFirstTime?: boolean
  onComplete?: () => void
}

interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  icon: React.ReactNode
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
  actionText?: string
  proTip?: string
  challenge?: string
  celebration?: boolean
}

const GrowflyTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [stepCompleted, setStepCompleted] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

  // ✅ FIXED: Respond to isFirstTime prop changes properly
  useEffect(() => {
    console.log('🎯 Tutorial isFirstTime changed:', isFirstTime, 'isActive:', isActive)
    if (isFirstTime) {
      console.log('🚀 Starting tutorial from prop change')
      // Reset state for fresh start
      setCurrentStep(0)
      setStepCompleted(false)
      setUserInteracted(false)
      setTargetRect(null)
      
      // Start tutorial after a short delay
      setTimeout(() => {
        startTutorial()
        playSound('welcome')
      }, 500)
    } else if (!isFirstTime && isActive) {
      // If isFirstTime becomes false and tutorial is active, close it
      console.log('🎯 Closing tutorial due to isFirstTime becoming false')
      setIsActive(false)
    }
  }, [isFirstTime])

  // Sound effects using Web Audio API
  const playSound = useCallback((type: 'start' | 'step' | 'complete' | 'welcome' | 'celebration') => {
    if (typeof window === 'undefined') return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different frequencies for different actions
      const frequencies = {
        start: [440, 550, 660],
        step: [523.25],
        complete: [523.25, 659.25, 783.99],
        welcome: [440, 523.25, 659.25],
        celebration: [523.25, 659.25, 783.99, 1046.50]
      }
      
      const freq = frequencies[type]
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime)
      
      if (freq.length > 1) {
        freq.forEach((f, i) => {
          oscillator.frequency.setValueAtTime(f, audioContext.currentTime + i * 0.1)
        })
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Gracefully handle audio errors
      console.log('Audio not available')
    }
  }, [])

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      target: 'body',
      title: 'Welcome to Growfly! 🚀',
      content: 'Get ready for an incredible journey! Growfly is your AI-powered business growth companion that adapts to YOUR unique needs. With cutting-edge features added daily, you\'re about to unlock the future of business success!',
      icon: <div className="relative"><Sparkles className="w-6 h-6 text-emerald-400" /></div>,
      placement: 'center',
      actionText: 'Start Your Journey',
      proTip: 'This tour takes just 2 minutes but could transform your business forever!',
      celebration: true
    },
    {
      id: 'dashboard',
      target: '[data-tour="dashboard"]',
      title: 'Your AI Command Center',
      content: 'This is mission control for your business growth! Here, you can have natural conversations with AI that knows YOUR brand, upload any file type for instant analysis, and generate content that sounds authentically you.',
      icon: <div className="relative"><Zap className="w-6 h-6 text-blue-400" /></div>,
      placement: 'bottom',
      actionText: 'Try asking: "Create a social media campaign for my new product launch"',
      proTip: 'Pro tip: The more specific you are, the more amazing your results will be!',
      challenge: 'Challenge: Upload a document and ask Growfly to summarize it in your brand voice'
    },
    {
      id: 'saved-responses',
      target: '[data-tour="saved-responses"]',
      title: 'Your Digital Treasure Vault',
      content: 'Every brilliant response becomes a reusable asset! Save your best AI-generated content here and build an ever-growing library of winning templates, copy, and ideas that you can customize and reuse infinitely.',
      icon: <div className="relative"><Heart className="w-6 h-6 text-pink-400" /></div>,
      placement: 'right',
      actionText: 'Build your content empire, one response at a time',
      proTip: 'Smart entrepreneurs save everything - you never know when you\'ll need that perfect headline again!',
      challenge: 'Goal: Create your first template library this week'
    },
    {
      id: 'collab-zone',
      target: '[data-tour="collab-zone"]',
      title: 'Team Collaboration Magic',
      content: 'Transform solo work into team brilliance! Share AI responses instantly with your team, collaborate in real-time, provide feedback, and download polished final versions. Turn individual insights into collective genius.',
      icon: <div className="relative"><Users className="w-6 h-6 text-indigo-400" /></div>,
      placement: 'right',
      actionText: 'Perfect for agencies, marketing teams, and content creators',
      proTip: 'Teams using collaborative AI are 3x more productive than solo workers!',
      challenge: 'Next step: Invite your first team member and share a response'
    },
    {
      id: 'gallery',
      target: '[data-tour="gallery"]',
      title: 'Your Creative Gallery',
      content: 'Every visual you create becomes part of your growing creative portfolio! Browse stunning AI-generated artwork, organize by campaigns, and watch your visual brand library expand with every creation.',
      icon: <div className="relative"><Image className="w-6 h-6 text-purple-400" /></div>,
      placement: 'right',
      actionText: 'From social media graphics to presentation visuals - all in one place',
      proTip: 'Visual content gets 94% more engagement than text alone!',
      challenge: 'Try this: Generate 5 different styles of the same concept'
    },
    {
      id: 'education-hub',
      target: '[data-tour="education-hub"]',
      title: 'AI Mastery Academy',
      content: 'Level up from AI beginner to business growth expert! Access cutting-edge strategies, proven frameworks, and insider techniques that top entrepreneurs use to 10x their results with AI.',
      icon: <div className="relative"><BookOpen className="w-6 h-6 text-amber-400" /></div>,
      placement: 'right',
      actionText: 'From prompt engineering to growth hacking - master it all',
      proTip: 'Companies using AI strategically grow 5x faster than competitors!',
      challenge: 'This week: Complete one advanced tutorial and implement the strategy'
    },
    {
      id: 'wishlist',
      target: '[data-tour="wishlist"]',
      title: 'Shape Growfly\'s Future',
      content: 'Your ideas drive our innovation! This isn\'t just a suggestion box - it\'s where game-changing features are born. Our development team prioritizes the most-loved ideas from power users like you.',
      icon: <div className="relative"><Lightbulb className="w-6 h-6 text-yellow-400" /></div>,
      placement: 'right',
      actionText: 'Your breakthrough idea could become reality within weeks',
      proTip: 'Users who actively suggest features get early access to new releases!',
      challenge: 'Mission: Submit your first feature idea and vote on others'
    },
    {
      id: 'trusted-partners',
      target: '[data-tour="trusted-partners"]',
      title: 'Human + AI Powerhouse',
      content: 'Coming soon: The perfect fusion of AI efficiency and human expertise! Connect with verified professionals who can take your AI-generated work to the final mile. Think AI + expert = unstoppable results.',
      icon: <div className="relative"><Handshake className="w-6 h-6 text-green-400" /></div>,
      placement: 'right',
      actionText: 'The future of work: AI creativity + human polish',
      proTip: 'Early access list members get 50% off professional services when we launch!',
      challenge: 'Be ready: Join the waitlist for exclusive early access'
    },
    {
      id: 'brand-settings',
      target: '[data-tour="brand-settings"]',
      title: 'Your Brand DNA Lab',
      content: 'This is where the magic begins! Fine-tune how Growfly understands your unique voice, style, and business personality. The more it knows about you, the more it becomes your perfect AI business partner.',
      icon: <div className="relative"><Settings className="w-6 h-6 text-slate-400" /></div>,
      placement: 'right',
      actionText: 'Make every AI response sound authentically YOU',
      proTip: 'Brands with consistent voice across all content see 23% more revenue!',
      challenge: 'Action item: Spend 5 minutes perfecting your brand voice settings'
    },
    {
      id: 'xp-system',
      target: '[data-tour="xp-system"]',
      title: 'Level Up & Get Rewarded',
      content: 'Every interaction makes you stronger! Earn XP, unlock achievements, and climb the leaderboards. Top performers get exclusive rewards: gift cards, VIP event access, networking opportunities, and surprise bonuses!',
      icon: <div className="relative"><Trophy className="w-6 h-6 text-orange-400" /></div>,
      placement: 'left',
      actionText: 'Gaming meets business growth - achieve while you succeed',
      proTip: 'Power users in the top 10% get monthly surprise rewards!',
      challenge: 'Your first goal: Reach level 5 this week by engaging daily'
    },
    {
      id: 'finale',
      target: 'body',
      title: 'You\'re Ready to Dominate!',
      content: 'Congratulations, growth hacker! You\'ve unlocked the full power of Growfly. You\'re now equipped with tools that 99% of businesses don\'t even know exist. Time to leave your competition in the dust!',
      icon: <div className="relative"><Rocket className="w-6 h-6 text-emerald-400" /></div>,
      placement: 'center',
      actionText: 'Start your business transformation NOW',
      proTip: 'Remember: You can replay this tour anytime from Settings → Tutorial',
      challenge: 'Ultimate challenge: Generate your first piece of content right now!',
      celebration: true
    }
  ]

  // ✅ FIXED: Simplified start tutorial function
  const startTutorial = () => {
    console.log('🎯 Starting tutorial...')
    setIsActive(true)
    setCurrentStep(0)
    setStepCompleted(false)
    setUserInteracted(false)
    updateTargetPosition(tutorialSteps[0])
    playSound('start')
  }

  const updateTargetPosition = (step: TutorialStep) => {
    setIsAnimating(true)
    
    if (step.target === 'body') {
      setTargetRect(null)
      setIsAnimating(false)
      return
    }

    setTimeout(() => {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Add pulse animation to target
        element.style.animation = 'tutorial-pulse 2s infinite'
        setTimeout(() => {
          if (element.style) element.style.animation = ''
        }, 4000)
      } else {
        console.log('🎯 Target element not found:', step.target)
        setTargetRect(null)
      }
      setIsAnimating(false)
    }, 300)
  }

  const nextStep = () => {
    playSound('step')
    setStepCompleted(true)
    
    if (tutorialSteps[currentStep].celebration) {
      setShowConfetti(true)
      playSound('celebration')
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    setTimeout(() => {
      if (currentStep < tutorialSteps.length - 1) {
        const nextStepIndex = currentStep + 1
        setCurrentStep(nextStepIndex)
        setStepCompleted(false)
        setUserInteracted(false)
        updateTargetPosition(tutorialSteps[nextStepIndex])
      } else {
        closeTutorial()
      }
    }, 500)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1
      setCurrentStep(prevStepIndex)
      setStepCompleted(false)
      setUserInteracted(false)
      updateTargetPosition(tutorialSteps[prevStepIndex])
    }
  }

  // ✅ FIXED: Better close tutorial handling
  const closeTutorial = () => {
    console.log('✅ Closing tutorial')
    setShowConfetti(true)
    playSound('complete')
    
    setTimeout(() => {
      setIsActive(false)
      setTargetRect(null)
      setShowConfetti(false)
      setCurrentStep(0)
      setStepCompleted(false)
      setUserInteracted(false)
      
      // Call the parent's onComplete callback
      if (onComplete) {
        console.log('🎯 Calling onComplete callback')
        onComplete()
      }
    }, 1000)
  }

  // ✅ ENHANCED: Beautiful branded skip modal instead of browser confirm
  const handleSkipClick = () => {
    setShowSkipModal(true)
  }

  const confirmSkip = () => {
    setShowSkipModal(false)
    closeTutorial()
  }

  const cancelSkip = () => {
    setShowSkipModal(false)
  }

  console.log('🎯 Tutorial render state:', { 
    isActive, 
    isFirstTime, 
    currentStep, 
    targetRect: !!targetRect,
    hasCompletedTutorial: typeof window !== 'undefined' ? localStorage.getItem('growfly-tutorial-completed') : null
  })

  if (!isActive) {
    console.log('🎯 Tutorial not active, not rendering')
    return null
  }

  const currentStepData = tutorialSteps[currentStep]
  const isCenter = currentStepData.placement === 'center'
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  // ✅ COMPLETELY FIXED: Perfect positioning that prevents scrolling issues
  const getTooltipPosition = () => {
    if (isCenter || !targetRect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }
    }

    const tooltipWidth = 480
    const tooltipHeight = 420
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 24

    let top = 0
    let left = 0

    // Calculate initial position based on placement
    switch (currentStepData.placement) {
      case 'bottom':
        top = targetRect.bottom + padding
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
        break
      case 'top':
        top = targetRect.top - padding - tooltipHeight
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
        break
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2)
        left = targetRect.right + padding
        break
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2)
        left = targetRect.left - padding - tooltipWidth
        break
    }

    // ✅ CRITICAL FIX: Ensure tooltip is ALWAYS fully visible within viewport
    // Horizontal constraints
    if (left < padding) {
      left = padding
    }
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding
    }

    // Vertical constraints - this prevents the scrolling issue
    if (top < padding) {
      top = padding
    }
    if (top + tooltipHeight > viewportHeight - padding) {
      top = viewportHeight - tooltipHeight - padding
    }

    return {
      position: 'fixed' as const,
      top: `${Math.max(padding, top)}px`,
      left: `${Math.max(padding, left)}px`,
      zIndex: 1000,
    }
  }

  return (
    <>
      {/* ✨ STUNNING: Premium particle celebration effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                animation: 'sparkle-float 3s ease-out forwards'
              }}
            >
              <div className={`text-2xl transform rotate-${Math.floor(Math.random() * 360)} opacity-90 animate-pulse`}>
                {['✨', '🎯', '⚡', '🚀', '💎', '🌟', '🎊', '🔥'][Math.floor(Math.random() * 8)]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎨 PREMIUM: Ultra-modern overlay with glassmorphism */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/50 to-slate-900/80 z-[999] backdrop-blur-lg">
        
        {/* ✨ INCREDIBLE: Dynamic spotlight with animated ring */}
        {targetRect && !isCenter && (
          <>
            {/* Animated spotlight background */}
            <div 
              className="absolute rounded-2xl transition-all duration-700 ease-out"
              style={{
                top: targetRect.top - 16,
                left: targetRect.left - 16,
                width: targetRect.width + 32,
                height: targetRect.height + 32,
                boxShadow: `
                  0 0 0 9999px rgba(15, 23, 42, 0.4),
                  0 0 60px rgba(59, 130, 246, 0.3),
                  inset 0 0 60px rgba(99, 102, 241, 0.1)
                `,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
              }}
            />
            
            {/* Pulsing border ring */}
            <div 
              className="absolute border-4 border-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 rounded-2xl animate-pulse transition-all duration-700 ease-out"
              style={{
                top: targetRect.top - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2), rgba(16, 185, 129, 0.2))',
                borderRadius: '16px',
                padding: '4px',
              }}
            >
              <div 
                className="w-full h-full rounded-xl bg-transparent"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(16, 185, 129, 0.1))',
                }}
              />
            </div>
            
            {/* Floating indicator dot */}
            <div 
              className="absolute w-4 h-4 rounded-full animate-bounce"
              style={{
                top: targetRect.top + targetRect.height / 2 - 8,
                left: targetRect.left + targetRect.width / 2 - 8,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
              }}
            />
          </>
        )}

        {/* 🚀 INCREDIBLE: Modern glassmorphic tooltip with stunning design */}
        <div 
          className={`absolute transform transition-all duration-500 ease-out ${
            isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-[480px] max-w-[95vw]">
            {/* Background with incredible glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20" />
            
            {/* Premium gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl p-0.5">
              <div className="w-full h-full bg-gradient-to-br from-white/95 via-white/90 to-white/95 rounded-3xl" />
            </div>

            {/* Content container */}
            <div className="relative p-8">
              {/* ✨ STUNNING: Premium header with animated icon */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {/* Animated icon background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl animate-pulse" />
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg border border-white/40">
                      {currentStepData.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-1">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Play className="w-4 h-4" />
                      <span>Interactive Tutorial</span>
                    </div>
                  </div>
                </div>
                
                {/* ✨ PREMIUM: Elegant close button */}
                <button 
                  onClick={handleSkipClick}
                  className="group relative w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/40 hover:shadow-xl hover:scale-105"
                  title="Skip tour"
                >
                  <X className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors duration-200" strokeWidth={2} />
                </button>
              </div>

              {/* 🎨 BEAUTIFUL: Content sections with premium styling */}
              <div className="space-y-5 mb-8">
                <p className="text-slate-700 text-base leading-relaxed font-medium">
                  {currentStepData.content}
                </p>
                
                {currentStepData.actionText && (
                  <div className="relative p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/60 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl" />
                    <div className="relative flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 mt-0.5">
                        <Target className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-emerald-800 text-sm mb-1">🎯 Action Step</div>
                        <p className="text-emerald-700 text-sm font-medium leading-relaxed">
                          {currentStepData.actionText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStepData.proTip && (
                  <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl" />
                    <div className="relative flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 mt-0.5">
                        <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-blue-800 text-sm mb-1">💡 Pro Tip</div>
                        <p className="text-blue-700 text-sm font-medium leading-relaxed">
                          {currentStepData.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 🚀 STUNNING: Progress indicator with gradient */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-semibold mb-3">
                  <span className="text-slate-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="relative w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                  </div>
                </div>
              </div>

              {/* 🎯 INCREDIBLE: Premium navigation with rounded buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkipClick}
                  className="group relative px-5 py-3 text-slate-600 hover:text-slate-800 text-sm font-semibold bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-2xl transition-all duration-300 shadow-lg border border-white/40 hover:shadow-xl hover:scale-105"
                >
                  <span className="relative z-10">Skip Tour</span>
                </button>
                
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="group relative flex items-center gap-2 px-5 py-3 text-slate-700 hover:text-slate-900 text-sm font-semibold bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 rounded-2xl transition-all duration-300 shadow-lg border border-white/60 hover:shadow-xl hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                      <span className="relative z-10">Back</span>
                    </button>
                  )}
                  
                  <button
                    onClick={nextStep}
                    className="group relative flex items-center gap-2 px-6 py-3 text-white text-sm font-bold bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                    {currentStep === tutorialSteps.length - 1 ? (
                      <>
                        <Rocket className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" strokeWidth={2.5} />
                        <span className="relative z-10">Get Started!</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Continue</span>
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 INCREDIBLE: Premium skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[1200] flex items-center justify-center backdrop-blur-xl p-4">
          <div className="relative max-w-md w-full">
            {/* Background with glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20" />
            
            {/* Premium gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl p-0.5">
              <div className="w-full h-full bg-gradient-to-br from-white/95 via-white/90 to-white/95 rounded-3xl" />
            </div>

            {/* Content */}
            <div className="relative p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg border border-white/40">
                  <Sparkles className="w-6 h-6 text-blue-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Skip Tutorial?</h3>
                  <p className="text-sm text-slate-600 font-medium">You can always restart it later</p>
                </div>
              </div>
              
              {/* Content */}
              <p className="text-slate-700 text-sm mb-8 leading-relaxed font-medium">
                This quick tour shows you powerful features that could
                <span className="font-bold text-slate-800"> save you hours</span> and help you get 
                <span className="font-bold text-slate-800"> better results faster</span>.
              </p>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 hover:text-slate-800 py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg border border-white/40 hover:shadow-xl"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10">Continue Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ PREMIUM: Advanced CSS animations */}
      <style jsx global>{`
        @keyframes tutorial-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes sparkle-float {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(-50px) rotate(180deg) scale(1.2);
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-120px) rotate(360deg) scale(0.6);
            opacity: 0;
          }
        }
        
        @media (max-width: 768px) {
          .tutorial-modal {
            max-width: 95vw !important;
            width: 95vw !important;
            margin: 0 2.5vw !important;
          }
        }
      `}</style>
    </>
  )
}

export default GrowflyTutorial