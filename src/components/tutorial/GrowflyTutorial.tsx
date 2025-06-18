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

  // 🚀 INTERACTIVE TUTORIAL STEPS - IMPROVED ORDER
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Interactive Tour! 🎯',
      content: 'Ready for a hands-on journey? I\'ll guide you through Growfly\'s most powerful features step by step. You\'ll actually use each feature as we explore together!',
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      actionText: 'Let\'s start with your AI command center!',
      proTip: 'This interactive tour takes 3 minutes and will make you a Growfly expert!',
      celebration: true
    },
    {
      id: 'dashboard-features',
      title: 'Your AI Command Center 🚀',
      content: 'This is where the magic happens! Upload images, ask questions, download results, and have conversations with AI that understands your business. Let\'s explore what you can do here.',
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      route: '/dashboard',
      target: '[data-tour="dashboard-main"], .chat-interface, [data-tour="chat-area"]',
      action: 'observe',
      actionText: 'Try asking: "Create a social media post" or upload an image for analysis!',
      proTip: 'You can upload any file type - images, PDFs, documents - and ask AI to analyze them!'
    },
    {
      id: 'chat-interaction',
      title: 'Start Your First Conversation 💬',
      content: 'Click in the message box below and try asking AI anything! Upload an image, ask for business advice, or request content creation.',
      icon: <MessageCircle className="w-6 h-6 text-emerald-400" />,
      target: '[data-tour="chat-input"], input[placeholder*="message"], textarea[placeholder*="message"], [data-tour="message-input"]',
      action: 'click',
      waitForUser: true,
      actionText: 'Click in the message box and try: "Create a social media campaign for my business"',
      proTip: 'The more specific you are, the more amazing your results will be!'
    },
    {
      id: 'saved-responses-nav',
      title: 'Your Content Treasure Vault 💎',
      content: 'Now let\'s see where all your brilliant AI responses get saved! Click "Saved Responses" to discover your growing content library.',
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
      route: '/saved',
      target: '[href="/saved"], [data-nav="saved-responses"], a:contains("Saved Responses")',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Saved Responses" in the sidebar!',
      proTip: 'Every brilliant response becomes a reusable template - never lose a great idea again!'
    },
    {
      id: 'saved-features',
      title: 'Your Content Empire 📚',
      content: 'Every amazing AI response you generate gets saved here automatically. Build templates, organize by campaigns, and create your own content library!',
      icon: <Heart className="w-6 h-6 text-pink-400" />,
      target: '[data-tour="saved-content"], [data-tour="responses-grid"], .saved-responses-container',
      action: 'observe',
      actionText: 'Your content library grows with every interaction!',
      proTip: 'Smart entrepreneurs save everything - you never know when you\'ll need that perfect headline again'
    },
    {
      id: 'gallery-nav',
      title: 'Visual Creativity Hub 🎨',
      content: 'Ready to see your creative gallery? Click "Gallery" to explore where all your AI-generated visual masterpieces live!',
      icon: <Palette className="w-6 h-6 text-purple-400" />,
      route: '/gallery',
      target: '[href="/gallery"], [data-nav="gallery"], a:contains("Gallery")',
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
      target: '[data-tour="gallery-grid"], [data-tour="image-grid"], .gallery-container',
      action: 'observe',
      actionText: 'Your visual empire starts here!',
      proTip: 'Generate multiple styles of the same concept to find what works best'
    },
    {
      id: 'collab-zone-nav',
      title: 'Team Collaboration Magic ✨',
      content: 'Time to see your collaboration headquarters! Click "Collab Zone" to discover where teams become unstoppable.',
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      route: '/collab-zone',
      target: '[href="/collab-zone"], [data-nav="collab-zone"], a:contains("Collab Zone")',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Collab Zone" in the sidebar now!',
      proTip: 'Teams using collaborative AI are 3x more productive!'
    },
    {
      id: 'collab-features',
      title: 'Collaboration Superpowers 🤝',
      content: 'Here\'s where magic happens! Share AI responses with your team, get feedback in real-time, and build collective brilliance. Perfect for agencies and teams!',
      icon: <Target className="w-6 h-6 text-green-400" />,
      target: '[data-tour="collab-features"], [data-tour="collaboration-area"], .collab-container',
      action: 'observe',
      actionText: 'This is where teams become unstoppable!',
      proTip: 'Share any AI response instantly with one click'
    },
    {
      id: 'trusted-partners-nav',
      title: 'Human + AI Powerhouse 💼',
      content: 'Let\'s check out the future of work! Click "Trusted Partners" to see where AI creativity meets human expertise.',
      icon: <Handshake className="w-6 h-6 text-green-400" />,
      route: '/trusted-partners',
      target: '[href="/trusted-partners"], [data-nav="trusted-partners"], a:contains("Trusted Partners")',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Trusted Partners" to see what\'s coming!',
      proTip: 'The perfect fusion of AI efficiency and human polish - coming soon!'
    },
    {
      id: 'trusted-partners-features',
      title: 'The Future of Work 🔮',
      content: 'Coming soon: Connect with verified professionals who can take your AI-generated work to the final mile. Think AI + expert = unstoppable results!',
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      target: '[data-tour="partners-area"], [data-tour="coming-soon"], .partners-container',
      action: 'observe',
      actionText: 'Early access members get 50% off when we launch!',
      proTip: 'Join the waitlist now for exclusive early access and special pricing'
    },
    {
      id: 'brand-settings-nav',
      title: 'Your Brand DNA Lab 🧬',
      content: 'Let\'s fine-tune your AI assistant! Click "Brand Settings" to teach Growfly your unique voice and style.',
      icon: <Settings className="w-6 h-6 text-slate-400" />,
      route: '/brand-settings',
      target: '[href="/brand-settings"], [data-nav="brand-settings"], a:contains("Brand Settings")',
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
      target: '[data-tour="brand-voice"], [data-tour="brand-settings"], .brand-settings-container',
      action: 'observe',
      actionText: 'Make every AI response authentically YOU!',
      proTip: 'Brands with consistent voice see 23% more revenue'
    },
    {
      id: 'education-hub-nav',
      title: 'AI Mastery Academy 🎓',
      content: 'Ready to level up? Click "Education Hub" to access cutting-edge strategies and become an AI expert!',
      icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
      route: '/nerd-mode',
      target: '[href="/nerd-mode"], [data-nav="education-hub"], a:contains("Education Hub")',
      action: 'click',
      waitForUser: true,
      actionText: 'Click "Education Hub" to unlock advanced strategies!',
      proTip: 'Companies using AI strategically grow 5x faster than competitors!'
    },
    {
      id: 'education-features',
      title: 'Become an AI Expert 🧠',
      content: 'Access proven frameworks, insider techniques, and cutting-edge strategies that top entrepreneurs use to 10x their results with AI!',
      icon: <Trophy className="w-6 h-6 text-amber-400" />,
      target: '[data-tour="education-content"], [data-tour="learning-area"], .education-container',
      action: 'observe',
      actionText: 'From prompt engineering to growth hacking - master it all!',
      proTip: 'Complete one tutorial this week and watch your results transform'
    },
    {
      id: 'finale',
      title: 'You\'re Ready to Dominate! 🏆',
      content: 'Congratulations! You\'ve mastered Growfly\'s core features. You\'re now equipped with AI superpowers that 99% of businesses don\'t even know exist!',
      icon: <Rocket className="w-6 h-6 text-emerald-400" />,
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
      try {
        router.push(step.route)
        // Wait for navigation to complete
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (error) {
        console.log('❌ Navigation error:', error)
        // Continue anyway - don't quit tutorial
      }
    }
    
    // Find and highlight target element with retry logic
    if (step.target) {
      let retryCount = 0
      const maxRetries = 3
      
      const findElement = () => {
        // Try multiple selectors for better compatibility
        const selectors = step.target!.split(', ')
        let element: HTMLElement | null = null
        
        for (const selector of selectors) {
          try {
            element = document.querySelector(selector.trim()) as HTMLElement
            if (element) break
          } catch (error) {
            console.log(`❌ Selector error for ${selector}:`, error)
          }
        }
        
        if (element) {
          console.log(`✅ Found target element:`, element)
          const rect = element.getBoundingClientRect()
          setTargetRect(rect)
          
          // Smooth scroll with fallback
          try {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } catch (error) {
            console.log('❌ Scroll error:', error)
            // Fallback scroll
            window.scrollTo({
              top: element.offsetTop - window.innerHeight / 2,
              behavior: 'smooth'
            })
          }
          
          // Add interactive pulse animation
          element.style.animation = 'tutorial-interactive-pulse 2s infinite'
          setTimeout(() => {
            if (element && element.style) element.style.animation = ''
          }, 6000)
          
          setIsAnimating(false)
          return true
        } else {
          console.log(`🎯 Target element not found (attempt ${retryCount + 1}):`, step.target)
          retryCount++
          
          if (retryCount < maxRetries) {
            // Retry after a short delay
            setTimeout(findElement, 1000)
            return false
          } else {
            console.log('❌ Max retries reached, continuing without target highlight')
            setTargetRect(null)
            setIsAnimating(false)
            return true
          }
        }
      }
      
      // Start element finding with delay
      setTimeout(findElement, 500)
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
    let listenerActive = true
    
    const handleUserAction = (event: Event) => {
      if (!listenerActive) return
      
      const target = event.target as HTMLElement
      
      // Try multiple selectors for better compatibility
      const selectors = step.target!.split(', ')
      let stepElement: HTMLElement | null = null
      
      for (const selector of selectors) {
        try {
          stepElement = document.querySelector(selector.trim()) as HTMLElement
          if (stepElement) break
        } catch (error) {
          console.log(`❌ Selector error in listener for ${selector}:`, error)
        }
      }
      
      // Check if user clicked the target element or its children
      const isTargetClick = stepElement && (
        stepElement.contains(target) || 
        stepElement === target ||
        target.closest(step.target!) // Try closest match as fallback
      )
      
      if (isTargetClick) {
        console.log('✅ User completed required action!')
        listenerActive = false // Prevent multiple triggers
        setUserActionCompleted(true)
        setIsWaitingForUser(false)
        playSound('step')
        
        // Remove listener
        document.removeEventListener('click', handleUserAction)
        
        // Auto-advance after user action with delay
        setTimeout(() => {
          if (isActive) { // Only advance if tutorial is still active
            nextStep()
          }
        }, 1500)
      }
    }
    
    // Add click listener for user actions
    document.addEventListener('click', handleUserAction, { passive: true })
    
    // Cleanup after 45 seconds if no action (increased timeout)
    const timeoutId = setTimeout(() => {
      if (listenerActive) {
        console.log('⏱️ User action timeout, auto-advancing (this is normal)')
        listenerActive = false
        document.removeEventListener('click', handleUserAction)
        
        // Don't quit tutorial, just advance
        if (isWaitingForUser && isActive) {
          setUserActionCompleted(true)
          setIsWaitingForUser(false)
          setTimeout(() => {
            if (isActive) { // Double-check tutorial is still active
              nextStep()
            }
          }, 500)
        }
      }
    }, 45000)
    
    // Store cleanup function for manual cleanup if needed
    return () => {
      listenerActive = false
      document.removeEventListener('click', handleUserAction)
      clearTimeout(timeoutId)
    }
  }

  const nextStep = () => {
    // Safety check - don't advance if tutorial isn't active
    if (!isActive) {
      console.log('❌ Tutorial not active, not advancing')
      return
    }
    
    if (isWaitingForUser && !userActionCompleted) {
      console.log('⏳ Still waiting for user action, not advancing yet')
      // Don't advance if waiting for user action
      return
    }
    
    console.log(`✅ Advancing from step ${currentStep} to ${currentStep + 1}`)
    playSound('step')
    
    if (tutorialSteps[currentStep].celebration) {
      setShowConfetti(true)
      playSound('celebration')
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    setTimeout(() => {
      // Double-check tutorial is still active before advancing
      if (!isActive) {
        console.log('❌ Tutorial became inactive during advance, stopping')
        return
      }
      
      if (currentStep < tutorialSteps.length - 1) {
        const nextStepIndex = currentStep + 1
        console.log(`🎯 Moving to step ${nextStepIndex}: ${tutorialSteps[nextStepIndex].title}`)
        setCurrentStep(nextStepIndex)
        setUserActionCompleted(false)
        setIsWaitingForUser(false)
        updateCurrentStep(tutorialSteps[nextStepIndex])
      } else {
        console.log('🎉 Tutorial completed, closing')
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
        
        {/* ✨ IMPROVED: Crystal clear spotlight with sharp borders */}
        {hasTarget && (
          <>
            {/* Dark overlay with sharp cutout */}
            <div 
              className="absolute rounded-xl transition-all duration-700 ease-out"
              style={{
                top: targetRect!.top - 8,
                left: targetRect!.left - 8,
                width: targetRect!.width + 16,
                height: targetRect!.height + 16,
                boxShadow: `
                  0 0 0 9999px rgba(15, 23, 42, 0.85),
                  inset 0 0 0 4px rgba(59, 130, 246, 0.8)
                `,
                background: 'transparent',
              }}
            />
            
            {/* Bright, crisp border ring */}
            <div 
              className="absolute border-4 border-blue-400 rounded-xl transition-all duration-700 ease-out shadow-lg"
              style={{
                top: targetRect!.top - 6,
                left: targetRect!.left - 6,
                width: targetRect!.width + 12,
                height: targetRect!.height + 12,
                animation: isWaitingForAction ? 'tutorial-urgent-pulse 1s infinite' : 'tutorial-gentle-pulse 2s infinite',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
              }}
            />
            
            {/* Clear action indicator */}
            {isWaitingForAction && (
              <div 
                className="absolute flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-xl"
                style={{
                  top: targetRect!.top - 45,
                  left: targetRect!.left + targetRect!.width / 2 - 60,
                }}
              >
                <MousePointer className="w-4 h-4" />
                👆 Click here!
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