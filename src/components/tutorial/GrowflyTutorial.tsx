'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, ChevronLeft, Star, Rocket, 
  Target, Brain, Palette, MessageCircle, Gift, Crown, Wand2, Play,
  ArrowDown, MousePointer, Eye, Navigation
} from 'lucide-react'

interface GrowflyTutorialProps {
  isFirstTime?: boolean
  onComplete?: () => void
}

interface TutorialStep {
  id: string
  title: string
  content: string
  icon: React.ReactNode
  route?: string // Page to navigate to
  target?: string // Element to highlight
  action?: 'click' | 'type' | 'hover' | 'observe' // Required user action
  actionText?: string
  proTip?: string
  waitForUser?: boolean // Wait for user to perform action
  celebration?: boolean
}

const GrowflyInteractiveTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  onComplete 
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [userActionCompleted, setUserActionCompleted] = useState(false)
  const [isWaitingForUser, setIsWaitingForUser] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

  // ✅ Start tutorial when prop changes
  useEffect(() => {
    if (isFirstTime) {
      console.log('🚀 Starting interactive tutorial')
      setCurrentStep(0)
      setUserActionCompleted(false)
      setIsWaitingForUser(false)
      setTimeout(() => {
        startTutorial()
        playSound('welcome')
      }, 500)
    } else if (!isFirstTime && isActive) {
      setIsActive(false)
    }
  }, [isFirstTime])

  // Sound effects
  const playSound = useCallback((type: 'start' | 'step' | 'complete' | 'welcome' | 'celebration' | 'navigate') => {
    if (typeof window === 'undefined') return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      const frequencies = {
        start: [440, 550, 660],
        step: [523.25],
        complete: [523.25, 659.25, 783.99],
        welcome: [440, 523.25, 659.25],
        celebration: [523.25, 659.25, 783.99, 1046.50],
        navigate: [659.25, 783.99]
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
      console.log('Audio not available')
    }
  }, [])

  // 🚀 INTERACTIVE TUTORIAL STEPS
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Interactive Tour! 🎯',
      content: 'Ready for a hands-on journey? I\'ll guide you through Growfly\'s most powerful features step by step. You\'ll actually use each feature as we explore together!',
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      actionText: 'Let\'s start exploring your new superpower!',
      proTip: 'This interactive tour takes 3 minutes and will make you a Growfly expert!',
      celebration: true
    },
    {
      id: 'sidebar-navigation',
      title: 'Your Command Center 🎛️',
      content: 'This sidebar is your mission control! Each section unlocks different superpowers. Let\'s explore them one by one.',
      icon: <Navigation className="w-6 h-6 text-blue-400" />,
      target: '[data-sidebar]', // Target the entire sidebar
      action: 'observe',
      actionText: 'Look at all these powerful features waiting for you!',
      proTip: 'Each icon represents a different way to grow your business'
    },
    {
      id: 'collab-zone-nav',
      title: 'Team Collaboration Magic ✨',
      content: 'Let\'s visit your collaboration headquarters! Click "Collab Zone" in the sidebar to see where teams become unstoppable.',
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      route: '/collab-zone',
      target: '[href="/collab-zone"], [data-nav="collab-zone"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Collab Zone" in the sidebar now!',
      proTip: 'Teams using collaborative AI are 3x more productive!'
    },
    {
      id: 'collab-features',
      title: 'Collaboration Superpowers 🤝',
      content: 'Here\'s where magic happens! Share AI responses with your team, get feedback in real-time, and build collective brilliance.',
      icon: <Heart className="w-6 h-6 text-pink-400" />,
      target: '[data-tour="collab-features"]',
      action: 'observe',
      actionText: 'This is where teams become unstoppable!',
      proTip: 'Share any AI response instantly with one click'
    },
    {
      id: 'saved-responses-nav',
      title: 'Your Content Treasure Vault 💎',
      content: 'Time to see your digital gold mine! Click "Saved Responses" to discover your growing content library.',
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
      route: '/saved-responses',
      target: '[href="/saved-responses"], [data-nav="saved-responses"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Saved Responses" in the sidebar!',
      proTip: 'Every brilliant response becomes a reusable template'
    },
    {
      id: 'saved-features',
      title: 'Your Content Empire 📚',
      content: 'Every amazing AI response you generate gets saved here. Build templates, organize by campaigns, and never lose a great idea again!',
      icon: <Target className="w-6 h-6 text-green-400" />,
      target: '[data-tour="saved-content"]',
      action: 'observe',
      actionText: 'Your content library grows with every interaction!',
      proTip: 'Smart entrepreneurs save everything - you never know when you\'ll need that perfect headline'
    },
    {
      id: 'gallery-nav',
      title: 'Visual Creativity Hub 🎨',
      content: 'Ready to see your creative gallery? Click "Gallery" to explore your AI-generated visual masterpieces!',
      icon: <Palette className="w-6 h-6 text-purple-400" />,
      route: '/gallery',
      target: '[href="/gallery"], [data-nav="gallery"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Gallery" to see your creative workspace!',
      proTip: 'Visual content gets 94% more engagement than text alone'
    },
    {
      id: 'gallery-features',
      title: 'Creative Powerhouse 🖼️',
      content: 'Every image you create with AI becomes part of your growing visual brand library. Organize by campaigns and watch your creativity compound!',
      icon: <Image className="w-6 h-6 text-cyan-400" />,
      target: '[data-tour="gallery-grid"]',
      action: 'observe',
      actionText: 'Your visual empire starts here!',
      proTip: 'Generate multiple styles of the same concept to find what works best'
    },
    {
      id: 'brand-settings-nav',
      title: 'Your Brand DNA Lab 🧬',
      content: 'Let\'s fine-tune your AI assistant! Click "Brand Settings" to teach Growfly your unique voice and style.',
      icon: <Settings className="w-6 h-6 text-slate-400" />,
      route: '/brand-settings',
      target: '[href="/brand-settings"], [data-nav="brand-settings"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Brand Settings" to personalize your AI!',
      proTip: 'The more Growfly knows about you, the better it becomes'
    },
    {
      id: 'brand-features',
      title: 'AI Personality Training 🎭',
      content: 'This is where you train your AI to sound exactly like YOU. Set your tone, style, and business personality for authentic results every time.',
      icon: <Brain className="w-6 h-6 text-orange-400" />,
      target: '[data-tour="brand-voice"]',
      action: 'observe',
      actionText: 'Make every AI response authentically YOU!',
      proTip: 'Brands with consistent voice see 23% more revenue'
    },
    {
      id: 'back-to-dashboard',
      title: 'Back to Mission Control 🚀',
      content: 'Let\'s return to your AI command center! Click "Dashboard" to see where the magic begins.',
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      route: '/dashboard',
      target: '[href="/dashboard"], [data-nav="dashboard"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Dashboard" to return to your AI workspace!',
      proTip: 'This is where every great idea starts'
    },
    {
      id: 'chat-interface',
      title: 'Your AI Conversation Partner 💬',
      content: 'This is where conversations become conversions! Type anything and watch Growfly understand your business like a human expert.',
      icon: <MessageCircle className="w-6 h-6 text-emerald-400" />,
      target: '[data-tour="chat-input"], input[placeholder*="message"], textarea[placeholder*="message"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click in the message box and try asking: "Create a social media post"',
      proTip: 'The more specific you are, the more amazing your results!'
    },
    {
      id: 'finale',
      title: 'You\'re Ready to Dominate! 🏆',
      content: 'Congratulations! You\'ve mastered Growfly\'s core features. You\'re now equipped with AI superpowers that 99% of businesses don\'t even know exist!',
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      actionText: 'Start creating amazing content right now!',
      proTip: 'Remember: You can replay this tour anytime from Settings → Tutorial',
      celebration: true
    }
  ]

  const startTutorial = () => {
    console.log('🎯 Starting interactive tutorial...')
    setIsActive(true)
    setCurrentStep(0)
    setUserActionCompleted(false)
    setIsWaitingForUser(false)
    updateCurrentStep(tutorialSteps[0])
    playSound('start')
  }

  const updateCurrentStep = async (step: TutorialStep) => {
    setIsAnimating(true)
    
    // Navigate to route if specified
    if (step.route && pathname !== step.route) {
      console.log(`🧭 Navigating to ${step.route}`)
      playSound('navigate')
      router.push(step.route)
      
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Find and highlight target element
    if (step.target) {
      setTimeout(() => {
        const element = document.querySelector(step.target!) as HTMLElement
        if (element) {
          const rect = element.getBoundingClientRect()
          setTargetRect(rect)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Add interactive pulse animation
          element.style.animation = 'tutorial-interactive-pulse 2s infinite'
          setTimeout(() => {
            if (element.style) element.style.animation = ''
          }, 6000)
        } else {
          console.log('🎯 Target element not found:', step.target)
          setTargetRect(null)
        }
        setIsAnimating(false)
      }, 500)
    } else {
      setTargetRect(null)
      setIsAnimating(false)
    }
    
    // Set up user interaction waiting
    if (step.waitForUser && step.action === 'click' && step.target) {
      setIsWaitingForUser(true)
      setUserActionCompleted(false)
      setupUserInteractionListener(step)
    } else {
      setIsWaitingForUser(false)
      setUserActionCompleted(true)
    }
  }

  const setupUserInteractionListener = (step: TutorialStep) => {
    const handleUserAction = (event: Event) => {
      const target = event.target as HTMLElement
      const stepElement = document.querySelector(step.target!)
      
      if (stepElement && (stepElement.contains(target) || stepElement === target)) {
        console.log('✅ User completed required action!')
        setUserActionCompleted(true)
        setIsWaitingForUser(false)
        playSound('step')
        
        // Remove listener
        document.removeEventListener('click', handleUserAction)
        
        // Auto-advance after user action
        setTimeout(() => {
          nextStep()
        }, 1500)
      }
    }
    
    // Add click listener for user actions
    document.addEventListener('click', handleUserAction)
    
    // Cleanup after 30 seconds if no action
    setTimeout(() => {
      document.removeEventListener('click', handleUserAction)
      if (isWaitingForUser) {
        console.log('⏱️ User action timeout, auto-advancing')
        setUserActionCompleted(true)
        setIsWaitingForUser(false)
      }
    }, 30000)
  }

  const nextStep = () => {
    if (isWaitingForUser && !userActionCompleted) {
      // Don't advance if waiting for user action
      return
    }
    
    playSound('step')
    
    if (tutorialSteps[currentStep].celebration) {
      setShowConfetti(true)
      playSound('celebration')
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    setTimeout(() => {
      if (currentStep < tutorialSteps.length - 1) {
        const nextStepIndex = currentStep + 1
        setCurrentStep(nextStepIndex)
        setUserActionCompleted(false)
        setIsWaitingForUser(false)
        updateCurrentStep(tutorialSteps[nextStepIndex])
      } else {
        closeTutorial()
      }
    }, 500)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1
      setCurrentStep(prevStepIndex)
      setUserActionCompleted(false)
      setIsWaitingForUser(false)
      updateCurrentStep(tutorialSteps[prevStepIndex])
    }
  }

  const closeTutorial = () => {
    console.log('✅ Closing interactive tutorial')
    setShowConfetti(true)
    playSound('complete')
    
    setTimeout(() => {
      setIsActive(false)
      setTargetRect(null)
      setShowConfetti(false)
      setCurrentStep(0)
      setUserActionCompleted(false)
      setIsWaitingForUser(false)
      
      if (onComplete) {
        console.log('🎯 Calling onComplete callback')
        onComplete()
      }
    }, 1000)
  }

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

  if (!isActive) {
    return null
  }

  const currentStepData = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100
  const hasTarget = currentStepData.target && targetRect
  const isWaitingForAction = isWaitingForUser && !userActionCompleted

  // Position tooltip near target element or center
  const getTooltipPosition = () => {
    if (!hasTarget) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }
    }

    const tooltipWidth = 420
    const tooltipHeight = 350
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 24

    // Position to the right of target by default
    let top = targetRect!.top + (targetRect!.height / 2) - (tooltipHeight / 2)
    let left = targetRect!.right + padding

    // If not enough space on right, try left
    if (left + tooltipWidth > viewportWidth - padding) {
      left = targetRect!.left - padding - tooltipWidth
    }

    // If still not enough space, position below
    if (left < padding) {
      top = targetRect!.bottom + padding
      left = targetRect!.left + (targetRect!.width / 2) - (tooltipWidth / 2)
    }

    // Ensure within viewport bounds
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding))
    left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding))

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000,
    }
  }

  return (
    <>
      {/* ✨ Premium celebration particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden">
          {[...Array(40)].map((_, i) => (
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
              <div className={`text-2xl transform rotate-${Math.floor(Math.random() * 360)} opacity-90`}>
                {['🎯', '⚡', '🚀', '💎', '🌟', '🎊', '🔥', '✨'][Math.floor(Math.random() * 8)]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎨 Interactive overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-blue-900/40 to-slate-900/70 z-[999] backdrop-blur-sm">
        
        {/* ✨ Advanced interactive spotlight */}
        {hasTarget && (
          <>
            {/* Animated spotlight with glow */}
            <div 
              className="absolute rounded-2xl transition-all duration-700 ease-out"
              style={{
                top: targetRect!.top - 12,
                left: targetRect!.left - 12,
                width: targetRect!.width + 24,
                height: targetRect!.height + 24,
                boxShadow: `
                  0 0 0 9999px rgba(15, 23, 42, 0.3),
                  0 0 80px rgba(59, 130, 246, 0.4),
                  inset 0 0 80px rgba(99, 102, 241, 0.1)
                `,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
              }}
            />
            
            {/* Interactive border ring */}
            <div 
              className="absolute border-4 rounded-2xl transition-all duration-700 ease-out"
              style={{
                top: targetRect!.top - 8,
                left: targetRect!.left - 8,
                width: targetRect!.width + 16,
                height: targetRect!.height + 16,
                borderImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981) 1',
                animation: isWaitingForAction ? 'tutorial-urgent-pulse 1s infinite' : 'tutorial-gentle-pulse 2s infinite',
              }}
            />
            
            {/* Action indicator */}
            {isWaitingForAction && (
              <div 
                className="absolute flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce"
                style={{
                  top: targetRect!.top - 35,
                  left: targetRect!.left + targetRect!.width / 2 - 50,
                }}
              >
                <MousePointer className="w-4 h-4" />
                Click here!
              </div>
            )}
          </>
        )}

        {/* 🚀 Interactive tutorial tooltip */}
        <div 
          className={`absolute transform transition-all duration-500 ease-out ${
            isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-[420px] max-w-[95vw]">
            {/* Glassmorphic background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20" />
            
            {/* Premium gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl p-0.5">
              <div className="w-full h-full bg-gradient-to-br from-white/95 via-white/90 to-white/95 rounded-3xl" />
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl animate-pulse" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg border border-white/40">
                      {currentStepData.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-1">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Play className="w-3 h-3" />
                      <span>Interactive Tutorial</span>
                      {isWaitingForAction && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium animate-pulse">Waiting for you...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleSkipClick}
                  className="group relative w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/40 hover:shadow-xl hover:scale-105"
                  title="Skip tour"
                >
                  <X className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors duration-200" strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {currentStepData.content}
                </p>
                
                {currentStepData.actionText && (
                  <div className={`relative p-3 rounded-2xl border shadow-sm ${
                    isWaitingForAction 
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 animate-pulse' 
                      : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/60'
                  }`}>
                    <div className={`absolute inset-0 rounded-2xl ${
                      isWaitingForAction ? 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5' : 'bg-gradient-to-br from-emerald-500/5 to-green-500/5'
                    }`} />
                    <div className="relative flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                        isWaitingForAction 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                          : 'bg-gradient-to-br from-emerald-500 to-green-500'
                      }`}>
                        {isWaitingForAction ? (
                          <MousePointer className="w-3 h-3 text-white" strokeWidth={2.5} />
                        ) : (
                          <Target className="w-3 h-3 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <div className={`font-semibold text-xs mb-1 ${
                          isWaitingForAction ? 'text-blue-800' : 'text-emerald-800'
                        }`}>
                          {isWaitingForAction ? '👆 Your Turn!' : '🎯 Action Step'}
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          isWaitingForAction ? 'text-blue-700' : 'text-emerald-700'
                        }`}>
                          {currentStepData.actionText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStepData.proTip && (
                  <div className="relative p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200/60 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl" />
                    <div className="relative flex items-start gap-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Brain className="w-3 h-3 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-amber-800 text-xs mb-1">💡 Pro Tip</div>
                        <p className="text-amber-700 text-xs font-medium leading-relaxed">
                          {currentStepData.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkipClick}
                  className="group relative px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl transition-all duration-300 shadow-lg border border-white/40 hover:shadow-xl hover:scale-105"
                >
                  Skip Tour
                </button>
                
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="group relative flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-slate-900 text-xs font-semibold bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 rounded-xl transition-all duration-300 shadow-lg border border-white/60 hover:shadow-xl hover:scale-105"
                    >
                      <ChevronLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                      Back
                    </button>
                  )}
                  
                  <button
                    onClick={nextStep}
                    disabled={isWaitingForAction}
                    className={`group relative flex items-center gap-2 px-5 py-2 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20 ${
                      isWaitingForAction 
                        ? 'bg-gradient-to-br from-slate-400 to-slate-500 cursor-not-allowed opacity-60' 
                        : 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 hover:scale-105'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
                    {currentStep === tutorialSteps.length - 1 ? (
                      <>
                        <Rocket className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" strokeWidth={2.5} />
                        <span className="relative z-10">Get Started!</span>
                      </>
                    ) : isWaitingForAction ? (
                      <>
                        <Eye className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                        <span className="relative z-10">Waiting...</span>
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

      {/* Skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[1200] flex items-center justify-center backdrop-blur-xl p-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20" />
            
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl p-0.5">
              <div className="w-full h-full bg-gradient-to-br from-white/95 via-white/90 to-white/95 rounded-3xl" />
            </div>

            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg border border-white/40">
                  <Sparkles className="w-5 h-5 text-blue-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Skip Interactive Tour?</h3>
                  <p className="text-xs text-slate-600 font-medium">You can always restart it later</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-sm mb-6 leading-relaxed font-medium">
                This interactive tour shows you powerful features that could
                <span className="font-bold text-slate-800"> save you hours</span> and help you 
                <span className="font-bold text-slate-800"> work more efficiently</span>.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 hover:text-slate-800 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg border border-white/40 hover:shadow-xl"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white py-2 px-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="relative z-10">Continue Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS animations */}
      <style jsx global>{`
        @keyframes tutorial-interactive-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
          }
          50% { 
            transform: scale(1.03);
            box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes tutorial-gentle-pulse {
          0%, 100% { 
            border-color: rgba(59, 130, 246, 0.8);
            transform: scale(1);
          }
          50% { 
            border-color: rgba(168, 85, 247, 0.8);
            transform: scale(1.01);
          }
        }
        
        @keyframes tutorial-urgent-pulse {
          0%, 100% { 
            border-color: rgba(239, 68, 68, 0.9);
            transform: scale(1);
          }
          50% { 
            border-color: rgba(59, 130, 246, 0.9);
            transform: scale(1.02);
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

export default GrowflyInteractiveTutorial