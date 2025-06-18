'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, Star, Rocket, 
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
  route?: string
  target?: string
  proTip?: string
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

  // ✅ Start tutorial when prop changes
  useEffect(() => {
    if (isFirstTime) {
      console.log('🚀 Starting quick visual tour')
      setCurrentStep(0)
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

  // 🚀 STREAMLINED TUTORIAL STEPS - QUICK & INFORMATIVE
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Quick 30-Second Tour! 🎯',
      content: 'Let me show you Growfly\'s power zones. This will take just 30 seconds!',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      celebration: true
    },
    {
      id: 'dashboard-features',
      title: 'AI Command Center 🚀',
      content: 'Upload images, chat with AI, get instant results. Your creativity hub.',
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      route: '/dashboard',
      target: '[data-tour="dashboard-main"], .chat-interface, [data-tour="chat-area"]',
      proTip: 'Upload any file type and ask AI to analyze it!'
    },
    {
      id: 'saved-responses',
      title: 'Content Vault 💎',
      content: 'Every AI response auto-saves here. Build your content library.',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      route: '/saved',
      target: '[href="/saved"], [data-nav="saved-responses"]',
      proTip: 'Never lose a brilliant idea again'
    },
    {
      id: 'gallery',
      title: 'Visual Gallery 🎨',
      content: 'All your AI-generated images organized and ready to use.',
      icon: <Image className="w-5 h-5 text-purple-400" />,
      route: '/gallery',
      target: '[href="/gallery"], [data-nav="gallery"]',
      proTip: 'Visual content gets 94% more engagement'
    },
    {
      id: 'collab-zone',
      title: 'Team Hub 🤝',
      content: 'Share AI responses with your team and collaborate instantly.',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      route: '/collab-zone',
      target: '[href="/collab-zone"], [data-nav="collab-zone"]',
      proTip: 'Teams using AI are 3x more productive'
    },
    {
      id: 'trusted-partners',
      title: 'Expert Network 💼',
      content: 'Coming soon: Professional services to polish your AI work.',
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      route: '/trusted-partners',
      target: '[href="/trusted-partners"], [data-nav="trusted-partners"]',
      proTip: 'AI + human expertise = unstoppable results'
    },
    {
      id: 'brand-settings',
      title: 'Brand DNA 🧬',
      content: 'Train AI to sound exactly like you and your brand.',
      icon: <Settings className="w-5 h-5 text-slate-400" />,
      route: '/brand-settings',
      target: '[href="/brand-settings"], [data-nav="brand-settings"]',
      proTip: 'Consistent voice = 23% more revenue'
    },
    {
      id: 'education-hub',
      title: 'AI Academy 🎓',
      content: 'Master advanced AI strategies and growth techniques.',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      route: '/nerd-mode',
      target: '[href="/nerd-mode"], [data-nav="education-hub"]',
      proTip: 'AI-savvy companies grow 5x faster'
    },
    {
      id: 'finale',
      title: 'Ready to Dominate! 🏆',
      content: 'You\'re now equipped with AI superpowers. Start creating!',
      icon: <Rocket className="w-5 h-5 text-emerald-400" />,
      proTip: 'Replay this tour anytime from Settings',
      celebration: true
    }
  ]

  const startTutorial = () => {
    console.log('🎯 Starting visual tour...')
    setIsActive(true)
    setCurrentStep(0)
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
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.log('❌ Navigation error:', error)
      }
    }
    
    // Find and highlight target element
    if (step.target) {
      setTimeout(() => {
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
          
          try {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } catch (error) {
            window.scrollTo({
              top: element.offsetTop - window.innerHeight / 2,
              behavior: 'smooth'
            })
          }
        } else {
          console.log(`🎯 Target element not found:`, step.target)
          setTargetRect(null)
        }
        
        setIsAnimating(false)
      }, 300)
    } else {
      setTargetRect(null)
      setIsAnimating(false)
    }
  }

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!isActive || isAnimating) return
    
    const timer = setTimeout(() => {
      nextStep()
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [currentStep, isActive, isAnimating])

  const nextStep = () => {
    if (!isActive) return
    
    console.log(`✅ Auto-advancing from step ${currentStep}`)
    playSound('step')
    
    if (tutorialSteps[currentStep].celebration) {
      setShowConfetti(true)
      playSound('celebration')
      setTimeout(() => setShowConfetti(false), 2000)
    }
    
    setTimeout(() => {
      if (!isActive) return
      
      if (currentStep < tutorialSteps.length - 1) {
        const nextStepIndex = currentStep + 1
        console.log(`🎯 Moving to step ${nextStepIndex}`)
        setCurrentStep(nextStepIndex)
        updateCurrentStep(tutorialSteps[nextStepIndex])
      } else {
        console.log('🎉 Tour completed')
        closeTutorial()
      }
    }, 300)
  }

  const closeTutorial = () => {
    console.log('✅ Closing tour')
    setShowConfetti(true)
    playSound('complete')
    
    setTimeout(() => {
      setIsActive(false)
      setTargetRect(null)
      setShowConfetti(false)
      setCurrentStep(0)
      
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

  // FIXED: Better positioning logic to prevent cut-off
  const getTooltipPosition = () => {
    const tooltipWidth = 320
    const tooltipHeight = 280
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 20

    if (!hasTarget || viewportWidth < 768) {
      // Center on mobile or no target
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: `${Math.min(tooltipWidth, viewportWidth - padding * 2)}px`,
      }
    }

    // Smart positioning for desktop
    let top = targetRect!.top + (targetRect!.height / 2) - (tooltipHeight / 2)
    let left = targetRect!.right + padding

    // Try right side first
    if (left + tooltipWidth > viewportWidth - padding) {
      // Try left side
      left = targetRect!.left - padding - tooltipWidth
    }

    // If still doesn't fit, position below
    if (left < padding) {
      top = targetRect!.bottom + padding
      left = Math.max(padding, Math.min(
        targetRect!.left + (targetRect!.width / 2) - (tooltipWidth / 2),
        viewportWidth - tooltipWidth - padding
      ))
    }

    // Ensure within viewport bounds
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding))

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000,
      width: `${tooltipWidth}px`,
    }
  }

  return (
    <>
      {/* ✨ Celebration particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 1}s`,
                animation: 'sparkle-float 2s ease-out forwards'
              }}
            >
              <div className={`text-xl transform rotate-${Math.floor(Math.random() * 360)} opacity-90`}>
                {['🎯', '⚡', '🚀', '💎', '🌟', '✨'][Math.floor(Math.random() * 6)]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎨 FIXED: Bright spotlight effect */}
      <div className="fixed inset-0 z-[999]">
        
        {/* FIXED: Crystal clear spotlight - bright and readable */}
        {hasTarget && (
          <>
            {/* Subtle dark overlay for non-highlighted areas */}
            <div 
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                background: `radial-gradient(ellipse ${targetRect!.width + 60}px ${targetRect!.height + 60}px at ${targetRect!.left + targetRect!.width/2}px ${targetRect!.top + targetRect!.height/2}px, transparent 0%, transparent 30%, rgba(15, 23, 42, 0.4) 70%)`
              }}
            />
            
            {/* Bright, animated border */}
            <div 
              className="absolute border-3 rounded-xl transition-all duration-700 ease-out"
              style={{
                top: targetRect!.top - 4,
                left: targetRect!.left - 4,
                width: targetRect!.width + 8,
                height: targetRect!.height + 8,
                borderColor: '#3b82f6',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                animation: 'tutorial-bright-pulse 2s infinite',
              }}
            />
            
            {/* Clean spotlight ring */}
            <div 
              className="absolute border-2 border-white/60 rounded-xl transition-all duration-700 ease-out"
              style={{
                top: targetRect!.top - 2,
                left: targetRect!.left - 2,
                width: targetRect!.width + 4,
                height: targetRect!.height + 4,
                boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
              }}
            />
          </>
        )}

        {/* 🚀 FIXED: Compact tutorial tooltip */}
        <div 
          className={`absolute transition-all duration-300 ease-out ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full">
            {/* Glassmorphic background */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30" />
            
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl p-0.5">
              <div className="w-full h-full bg-white/95 rounded-2xl" />
            </div>

            {/* Content */}
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center shadow-md border border-white/40">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h3 className="text-md font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent leading-tight">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Eye className="w-3 h-3" />
                      <span>Visual Tour</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleSkipClick}
                  className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm border border-white/40"
                  title="Skip tour"
                >
                  <X className="w-3 h-3 text-slate-600" strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3 mb-4">
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {currentStepData.content}
                </p>
                
                {currentStepData.proTip && (
                  <div className="relative p-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200/50 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                        <Brain className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-amber-800 text-xs mb-0.5">💡 Pro Tip</div>
                        <p className="text-amber-700 text-xs font-medium leading-relaxed">
                          {currentStepData.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkipClick}
                  className="px-3 py-1 text-slate-600 hover:text-slate-800 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 shadow-sm border border-white/40"
                >
                  Skip
                </button>
                
                <button
                  onClick={nextStep}
                  className="group flex items-center gap-1 px-4 py-1 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-3 h-3" strokeWidth={2.5} />
                      <span>Start!</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[1200] flex items-center justify-center backdrop-blur-xl p-4">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30" />
            
            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center shadow-md border border-white/40">
                  <Sparkles className="w-4 h-4 text-blue-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-md font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Skip Tour?</h3>
                  <p className="text-xs text-slate-600">Just 30 seconds left</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                This quick tour shows you powerful features that could save you hours.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm border border-white/40"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg border border-white/20"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Enhanced CSS animations */}
      <style jsx global>{`
        @keyframes tutorial-bright-pulse {
          0%, 100% { 
            border-color: #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4);
          }
          50% { 
            border-color: #8b5cf6;
            box-shadow: 0 0 25px rgba(139, 92, 246, 0.9), 0 0 50px rgba(139, 92, 246, 0.5);
          }
        }
        
        @keyframes sparkle-float {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(0.8);
            opacity: 1;
          }
          100% { 
            transform: translateY(-80px) rotate(360deg) scale(0.3);
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