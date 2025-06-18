'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, ChevronLeft, Star, Rocket, 
  Target, Brain, Palette, MessageCircle, Gift, Crown, Wand2
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
  }, [isFirstTime]) // Only depend on isFirstTime, not isActive

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
      icon: <div className="relative"><Sparkles className="w-6 h-6 text-emerald-600" /></div>,
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
      icon: <div className="relative"><Zap className="w-6 h-6 text-blue-600" /></div>,
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
      icon: <div className="relative"><Heart className="w-6 h-6 text-red-500" /></div>,
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
      icon: <div className="relative"><Users className="w-6 h-6 text-indigo-600" /></div>,
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
      icon: <div className="relative"><Image className="w-6 h-6 text-purple-600" /></div>,
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
      icon: <div className="relative"><BookOpen className="w-6 h-6 text-amber-600" /></div>,
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
      icon: <div className="relative"><Lightbulb className="w-6 h-6 text-yellow-600" /></div>,
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
      icon: <div className="relative"><Handshake className="w-6 h-6 text-green-600" /></div>,
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
      icon: <div className="relative"><Settings className="w-6 h-6 text-slate-600" /></div>,
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
      icon: <div className="relative"><Trophy className="w-6 h-6 text-orange-600" /></div>,
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
      icon: <div className="relative"><Rocket className="w-6 h-6 text-emerald-600" /></div>,
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

  // ✅ ENHANCED: Add debug logging to render
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
        zIndex: 60,
      }
    }

    const tooltipWidth = 420
    const tooltipHeight = 380
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 20

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
      zIndex: 60,
    }
  }

  return (
    <>
      {/* ✅ PROFESSIONAL: Subtle confetti for celebration moments */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[70]">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-lg opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '2s',
                animation: 'float 2s ease-out forwards'
              }}
            >
              {['✨', '🎯', '⚡', '🚀'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* ✅ PROFESSIONAL: Clean overlay */}
      <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm">
        
        {/* ✅ CLEAN: Professional spotlight effect */}
        {targetRect && !isCenter && (
          <>
            <div 
              className="absolute border-3 border-blue-500 rounded-lg shadow-2xl transition-all duration-500 ease-out"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6), 0 0 20px rgba(59, 130, 246, 0.5)',
              }}
            />
            
            {/* ✅ SUBTLE: Single professional indicator */}
            <div 
              className="absolute w-3 h-3 bg-blue-500 rounded-full animate-pulse"
              style={{
                top: targetRect.top + targetRect.height / 2 - 6,
                left: targetRect.left + targetRect.width / 2 - 6,
              }}
            />
          </>
        )}

        {/* ✅ PROFESSIONAL: Clean, modern tooltip design */}
        <div 
          className={`absolute bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-[420px] transform transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-6">
            {/* ✅ CLEAN: Professional header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                    {currentStepData.title}
                  </h3>
                </div>
              </div>
              {/* ✅ PROFESSIONAL: Clean close button */}
              <button 
                onClick={handleSkipClick}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-all duration-200 group"
                title="Skip tour"
              >
                <X className="w-4 h-4 text-slate-600 group-hover:text-slate-900" strokeWidth={2.5} />
              </button>
            </div>

            {/* ✅ CLEAN: Content sections */}
            <div className="space-y-4 mb-6">
              <p className="text-slate-700 text-sm leading-relaxed">
                {currentStepData.content}
              </p>
              
              {currentStepData.actionText && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-800">Action Step</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-medium">
                    {currentStepData.actionText}
                  </p>
                </div>
              )}
              
              {currentStepData.proTip && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">Pro Tip</span>
                  </div>
                  <p className="text-xs text-blue-700 font-medium">
                    {currentStepData.proTip}
                  </p>
                </div>
              )}
            </div>

            {/* ✅ CLEAN: Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-slate-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span className="text-slate-900">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* ✅ PROFESSIONAL: Clean navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleSkipClick}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                Skip Tour
              </button>
              
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-4 h-4" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PROFESSIONAL: Clean skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-[70] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm mx-4 border border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Skip Tutorial?</h3>
                  <p className="text-sm text-slate-600">You can always restart it later</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-slate-700 text-sm mb-6 leading-relaxed">
                This quick tour shows you powerful features that could 
                <strong> save you hours</strong> and help you get better results faster.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Continue Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CLEAN: Professional CSS animations */}
      <style jsx global>{`
        @keyframes tutorial-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes float {
          0% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @media (max-width: 768px) {
          .tutorial-tooltip {
            max-width: 90vw !important;
            width: 90vw !important;
            margin: 0 5vw !important;
          }
        }
      `}</style>
    </>
  )
}

export default GrowflyTutorial