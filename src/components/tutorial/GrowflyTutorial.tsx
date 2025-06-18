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
      icon: <div className="relative"><Sparkles className="w-8 h-8 text-purple-500 animate-pulse" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div></div>,
      placement: 'center',
      actionText: 'Start Your Journey',
      proTip: 'This tour takes just 2 minutes but could transform your business forever!',
      celebration: true
    },
    {
      id: 'dashboard',
      target: '[data-tour="dashboard"]',
      title: 'Your AI Command Center 🎯',
      content: 'This is mission control for your business growth! Here, you can have natural conversations with AI that knows YOUR brand, upload any file type for instant analysis, and generate content that sounds authentically you.',
      icon: <div className="relative"><Zap className="w-7 h-7 text-yellow-500" /><Target className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-spin" /></div>,
      placement: 'bottom',
      actionText: 'Try asking: "Create a social media campaign for my new product launch"',
      proTip: 'Pro tip: The more specific you are, the more amazing your results will be!',
      challenge: 'Challenge: Upload a document and ask Growfly to summarize it in your brand voice'
    },
    {
      id: 'saved-responses',
      target: '[data-tour="saved-responses"]',
      title: 'Your Digital Treasure Vault 💎',
      content: 'Every brilliant response becomes a reusable asset! Save your best AI-generated content here and build an ever-growing library of winning templates, copy, and ideas that you can customize and reuse infinitely.',
      icon: <div className="relative"><Heart className="w-7 h-7 text-red-500 animate-pulse" /><Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" /></div>,
      placement: 'right',
      actionText: 'Build your content empire, one response at a time',
      proTip: 'Smart entrepreneurs save everything - you never know when you\'ll need that perfect headline again!',
      challenge: 'Goal: Create your first template library this week'
    },
    {
      id: 'collab-zone',
      target: '[data-tour="collab-zone"]',
      title: 'Team Collaboration Magic 🤝',
      content: 'Transform solo work into team brilliance! Share AI responses instantly with your team, collaborate in real-time, provide feedback, and download polished final versions. Turn individual insights into collective genius.',
      icon: <div className="relative"><Users className="w-7 h-7 text-blue-500" /><Wand2 className="w-3 h-3 text-blue-300 absolute -top-1 -right-1 animate-bounce" /></div>,
      placement: 'right',
      actionText: 'Perfect for agencies, marketing teams, and content creators',
      proTip: 'Teams using collaborative AI are 3x more productive than solo workers!',
      challenge: 'Next step: Invite your first team member and share a response'
    },
    {
      id: 'gallery',
      target: '[data-tour="gallery"]',
      title: 'Your Creative Masterpiece Gallery 🎨',
      content: 'Every visual you create becomes part of your growing creative portfolio! Browse stunning AI-generated artwork, organize by campaigns, and watch your visual brand library expand with every creation.',
      icon: <div className="relative"><Image className="w-7 h-7 text-pink-500" /><Palette className="w-3 h-3 text-pink-300 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'right',
      actionText: 'From social media graphics to presentation visuals - all in one place',
      proTip: 'Visual content gets 94% more engagement than text alone!',
      challenge: 'Try this: Generate 5 different styles of the same concept'
    },
    {
      id: 'education-hub',
      target: '[data-tour="education-hub"]',
      title: 'AI Mastery Academy 🎓',
      content: 'Level up from AI beginner to business growth expert! Access cutting-edge strategies, proven frameworks, and insider techniques that top entrepreneurs use to 10x their results with AI.',
      icon: <div className="relative"><BookOpen className="w-7 h-7 text-indigo-500" /><Brain className="w-3 h-3 text-indigo-300 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'right',
      actionText: 'From prompt engineering to growth hacking - master it all',
      proTip: 'Companies using AI strategically grow 5x faster than competitors!',
      challenge: 'This week: Complete one advanced tutorial and implement the strategy'
    },
    {
      id: 'wishlist',
      target: '[data-tour="wishlist"]',
      title: 'Shape Growfly\'s Future 💡',
      content: 'Your ideas drive our innovation! This isn\'t just a suggestion box - it\'s where game-changing features are born. Our development team prioritizes the most-loved ideas from power users like you.',
      icon: <div className="relative"><Lightbulb className="w-7 h-7 text-yellow-500 animate-pulse" /><Star className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-spin" /></div>,
      placement: 'right',
      actionText: 'Your breakthrough idea could become reality within weeks',
      proTip: 'Users who actively suggest features get early access to new releases!',
      challenge: 'Mission: Submit your first feature idea and vote on others'
    },
    {
      id: 'trusted-partners',
      target: '[data-tour="trusted-partners"]',
      title: 'Human + AI Powerhouse 🌉',
      content: 'Coming soon: The perfect fusion of AI efficiency and human expertise! Connect with verified professionals who can take your AI-generated work to the final mile. Think AI + expert = unstoppable results.',
      icon: <div className="relative"><Handshake className="w-7 h-7 text-green-500" /><Rocket className="w-3 h-3 text-green-300 absolute -top-1 -right-1 animate-bounce" /></div>,
      placement: 'right',
      actionText: 'The future of work: AI creativity + human polish',
      proTip: 'Early access list members get 50% off professional services when we launch!',
      challenge: 'Be ready: Join the waitlist for exclusive early access'
    },
    {
      id: 'brand-settings',
      target: '[data-tour="brand-settings"]',
      title: 'Your Brand DNA Lab 🧬',
      content: 'This is where the magic begins! Fine-tune how Growfly understands your unique voice, style, and business personality. The more it knows about you, the more it becomes your perfect AI business partner.',
      icon: <div className="relative"><Settings className="w-7 h-7 text-gray-600" /><MessageCircle className="w-3 h-3 text-gray-400 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'right',
      actionText: 'Make every AI response sound authentically YOU',
      proTip: 'Brands with consistent voice across all content see 23% more revenue!',
      challenge: 'Action item: Spend 5 minutes perfecting your brand voice settings'
    },
    {
      id: 'xp-system',
      target: '[data-tour="xp-system"]',
      title: 'Level Up & Get Rewarded 🏆',
      content: 'Every interaction makes you stronger! Earn XP, unlock achievements, and climb the leaderboards. Top performers get exclusive rewards: gift cards, VIP event access, networking opportunities, and surprise bonuses!',
      icon: <div className="relative"><Trophy className="w-7 h-7 text-amber-500 animate-bounce" /><Gift className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'left',
      actionText: 'Gaming meets business growth - achieve while you succeed',
      proTip: 'Power users in the top 10% get monthly surprise rewards!',
      challenge: 'Your first goal: Reach level 5 this week by engaging daily'
    },
    {
      id: 'finale',
      target: 'body',
      title: 'You\'re Ready to Dominate! 🚀',
      content: 'Congratulations, growth hacker! You\'ve unlocked the full power of Growfly. You\'re now equipped with tools that 99% of businesses don\'t even know exist. Time to leave your competition in the dust!',
      icon: <div className="relative"><Rocket className="w-8 h-8 text-emerald-500 animate-bounce" /><Crown className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 animate-pulse" /></div>,
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

  // ✅ ENHANCED: Much better tooltip positioning - closer to targets and more visible
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

    const padding = 15 // Reduced padding for closer positioning
    const tooltipWidth = 450
    const tooltipHeight = 400
    let top = 0
    let left = 0

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
      default:
        top = targetRect.bottom + padding
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
    }

    // ✅ IMPROVED: Better boundary checks to keep tooltip visible
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    // Horizontal boundary checks
    if (left < 20) left = 20
    if (left + tooltipWidth > windowWidth - 20) left = windowWidth - tooltipWidth - 20
    
    // Vertical boundary checks
    if (top < 20) top = 20
    if (top + tooltipHeight > windowHeight - 20) top = windowHeight - tooltipHeight - 20

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 60,
    }
  }

  return (
    <>
      {/* ✅ ENHANCED: More spectacular confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[70]">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random()}s`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`
              }}
            >
              {['🎉', '✨', '🚀', '💎', '⭐', '🏆', '🎊', '💫', '🌟', '🎈'][Math.floor(Math.random() * 10)]}
            </div>
          ))}
        </div>
      )}

      {/* ✅ ENHANCED: Better overlay with reduced opacity to see background */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm">
        
        {/* ✅ ENHANCED: More dramatic spotlight effect */}
        {targetRect && !isCenter && (
          <>
            <div 
              className="absolute border-4 border-purple-400 rounded-2xl shadow-2xl transition-all duration-500 ease-out"
              style={{
                top: targetRect.top - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 50px rgba(139, 92, 246, 0.8), inset 0 0 20px rgba(139, 92, 246, 0.3)',
                animation: 'tutorial-glow 2s infinite ease-in-out'
              }}
            />
            
            {/* ✅ ENHANCED: Multiple pulsing indicators */}
            <div 
              className="absolute w-6 h-6 bg-yellow-400 rounded-full animate-ping shadow-lg"
              style={{
                top: targetRect.top + targetRect.height / 2 - 12,
                left: targetRect.left + targetRect.width / 2 - 12,
              }}
            />
            <div 
              className="absolute w-4 h-4 bg-white rounded-full animate-pulse"
              style={{
                top: targetRect.top + targetRect.height / 2 - 8,
                left: targetRect.left + targetRect.width / 2 - 8,
              }}
            />
          </>
        )}

        {/* ✅ ENHANCED: Magnificent tooltip design */}
        <div 
          className={`absolute bg-white rounded-3xl shadow-2xl max-w-lg w-[450px] transform transition-all duration-500 tutorial-tooltip ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          } ${stepCompleted ? 'scale-105' : ''}`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ ENHANCED: Dynamic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl animate-pulse" />
          
          {/* Content */}
          <div className="relative p-8">
            {/* ✅ ENHANCED: Header with better close button */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {currentStepData.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'} animate-pulse`} 
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium bg-yellow-100 px-2 py-1 rounded-full">Premium Feature</span>
                  </div>
                </div>
              </div>
              {/* ✅ FIXED: Much better close button with white X */}
              <button 
                onClick={handleSkipClick}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                title="Skip tour"
              >
                <X className="w-5 h-5 text-white font-bold" strokeWidth={3} />
              </button>
            </div>

            {/* ✅ ENHANCED: More engaging content layout */}
            <div className="space-y-4 mb-6">
              <p className="text-gray-700 text-lg leading-relaxed font-medium">
                {currentStepData.content}
              </p>
              
              {currentStepData.actionText && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600 animate-pulse" />
                    <span className="text-sm font-semibold text-green-800">Action Step:</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    {currentStepData.actionText}
                  </p>
                </div>
              )}
              
              {currentStepData.proTip && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-600 animate-bounce" />
                    <span className="text-sm font-semibold text-blue-800">Pro Tip:</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1 font-medium">
                    {currentStepData.proTip}
                  </p>
                </div>
              )}
              
              {currentStepData.challenge && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span className="text-sm font-semibold text-purple-800">Challenge:</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1 font-medium">
                    {currentStepData.challenge}
                  </p>
                </div>
              )}
            </div>

            {/* ✅ ENHANCED: More exciting progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-semibold mb-3">
                <span className="text-gray-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span className="text-purple-600 font-bold">{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-white opacity-40 rounded-full transition-all duration-700"
                  style={{ 
                    width: `${progress}%`,
                    animation: 'shimmer 2s infinite'
                  }}
                />
              </div>
              {progress > 50 && (
                <div className="text-center mt-3">
                  <span className="text-sm text-gray-600 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full shadow-sm border border-yellow-200">
                    🔥 You're absolutely crushing it! Keep going!
                  </span>
                </div>
              )}
            </div>

            {/* ✅ ENHANCED: Better navigation buttons */}
            <div className="flex justify-between items-center">
              {/* ✅ IMPROVED: Better skip button with rounded corners */}
              <button
                onClick={handleSkipClick}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Skip Tour
              </button>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 font-semibold bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-20 transform skew-x-12 -translate-x-full animate-shimmer" />
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-5 h-5" />
                      Let's Dominate! 🚀
                    </>
                  ) : (
                    <>
                      Next Amazing Feature
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Beautiful branded skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md mx-4 overflow-hidden transform scale-100 animate-pulse">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Wait, don't miss out! 🚀</h3>
                  <p className="text-purple-100 text-sm">You're about to skip something amazing</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6 leading-relaxed">
                This exclusive tour reveals <strong>game-changing features</strong> that could 
                <span className="bg-yellow-100 px-1 rounded"> transform your business forever</span>. 
                Most users discover at least 3 features they didn't know existed!
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-6 text-center text-xs">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg mb-1">⚡</div>
                  <div className="font-semibold text-blue-800">Hidden</div>
                  <div className="text-blue-600">Power Tools</div>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-lg mb-1">💎</div>
                  <div className="font-semibold text-green-800">Secret</div>
                  <div className="text-green-600">Features</div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg mb-1">🎯</div>
                  <div className="font-semibold text-purple-800">Pro</div>
                  <div className="text-purple-600">Tips</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-2xl font-semibold transition-all duration-200"
                >
                  Skip Anyway
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue Tour! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ENHANCED: Better CSS with improved animations */}
      <style jsx global>{`
        @keyframes tutorial-glow {
          0%, 100% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(139, 92, 246, 0.2);
          }
          50% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 1), inset 0 0 30px rgba(139, 92, 246, 0.4);
          }
        }
        
        @keyframes tutorial-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skew(-12deg); }
          100% { transform: translateX(300%) skew(-12deg); }
        }
        
        @keyframes animate-shimmer {
          0% { transform: translateX(-100%) skew(-12deg); }
          100% { transform: translateX(300%) skew(-12deg); }
        }
        
        .animate-shimmer {
          animation: animate-shimmer 2s infinite;
        }
        
        @media (max-width: 768px) {
          .tutorial-tooltip {
            max-width: 90vw !important;
            width: 90vw !important;
            margin: 0 5vw !important;
          }
        }
        
        @media (max-width: 480px) {
          .tutorial-tooltip {
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