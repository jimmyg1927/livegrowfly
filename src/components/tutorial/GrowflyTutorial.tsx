'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  route?: string
  target?: string
  proTip?: string
  celebration?: boolean
  priority?: number // For element finding priority
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
  const [elementFound, setElementFound] = useState(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ FIXED: Start tutorial when prop changes with safety checks
  useEffect(() => {
    if (isFirstTime && typeof window !== 'undefined' && typeof document !== 'undefined') {
      console.log('🚀 Starting dashboard tour')
      setCurrentStep(0)
      setTimeout(() => {
        try {
          startTutorial()
          playSound('welcome')
        } catch (error) {
          console.log('❌ Error starting tutorial:', error)
        }
      }, 500)
    } else if (!isFirstTime && isActive) {
      setIsActive(false)
    }
  }, [isFirstTime])

  // Remove auto-mode functionality

  // Enhanced sound effects
  const playSound = useCallback((type: 'start' | 'step' | 'complete' | 'welcome' | 'celebration' | 'navigate' | 'error' | 'success') => {
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
        navigate: [659.25, 783.99],
        error: [200, 150],
        success: [659.25, 783.99, 1046.50]
      }
      
      const freq = frequencies[type]
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime)
      
      if (freq.length > 1) {
        freq.forEach((f, i) => {
          oscillator.frequency.setValueAtTime(f, audioContext.currentTime + i * 0.1)
        })
      }
      
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.4)
    } catch (error) {
      console.log('Audio not available')
    }
  }, [])

  // 🚀 DASHBOARD-ONLY TUTORIAL STEPS - NO NAVIGATION
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Quick Dashboard Tour! 🎯',
      content: 'Let me show you what each area of Growfly does, right from here!',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      celebration: true,
      priority: 1
    },
    {
      id: 'dashboard-features',
      title: 'AI Command Center 🚀',
      content: 'You\'re here now! Upload images, chat with AI, get instant results. Your main creativity hub.',
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      target: '[href="/dashboard"], a[href*="dashboard"], nav a:contains("Dashboard"), .nav-item:first-child',
      proTip: 'Upload any file type - images, PDFs, documents - and ask AI to analyze them!',
      priority: 1
    },
    {
      id: 'saved-responses',
      title: 'Content Treasure Vault 💎',
      content: 'Click here to see every AI response you\'ve ever saved. Your personal content library.',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      target: '[href="/saved"], a[href*="saved"], nav a:contains("Saved"), [data-nav="saved-responses"]',
      proTip: 'Never lose a brilliant idea - everything auto-saves here!',
      priority: 2
    },
    {
      id: 'gallery',
      title: 'Visual Creativity Studio 🎨',
      content: 'Your AI-generated images live here. Perfect for building visual brand libraries.',
      icon: <Image className="w-5 h-5 text-purple-400" />,
      target: '[href="/gallery"], a[href*="gallery"], nav a:contains("Gallery"), [data-nav="gallery"]',
      proTip: 'Visual content gets 94% more engagement than text alone!',
      priority: 2
    },
    {
      id: 'collab-zone',
      title: 'Team Collaboration Hub 🤝',
      content: 'Share AI responses with your team instantly. Where collaboration magic happens.',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      target: '[href="/collab-zone"], a[href*="collab"], nav a:contains("Collab"), [data-nav="collab-zone"]',
      proTip: 'Teams using collaborative AI are 3x more productive!',
      priority: 2
    },
    {
      id: 'education-hub',
      title: 'AI Mastery Academy 🎓',
      content: 'Learn advanced AI strategies and growth techniques from experts.',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      target: '[href="/nerd-mode"], a[href*="education"], nav a:contains("Education"), [data-nav="education-hub"]',
      proTip: 'AI-savvy companies grow 5x faster than competitors!',
      priority: 2
    },
    {
      id: 'brand-settings',
      title: 'AI Personality Lab 🧬',
      content: 'Train your AI to sound exactly like you and your brand voice.',
      icon: <Settings className="w-5 h-5 text-slate-400" />,
      target: '[href="/brand-settings"], a[href*="brand"], nav a:contains("Brand"), [data-nav="brand-settings"]',
      proTip: 'Consistent brand voice increases revenue by 23%!',
      priority: 2
    },
    {
      id: 'trusted-partners',
      title: 'Expert Network 💼',
      content: 'Coming soon: Professional services to polish your AI work to perfection.',
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      target: '[href="/trusted-partners"], a[href*="partner"], nav a:contains("Partner"), [data-nav="trusted-partners"]',
      proTip: 'AI + human expertise = unstoppable results!',
      priority: 3
    },
    {
      id: 'finale',
      title: 'Ready to Create Magic! 🏆',
      content: 'You now know where everything is! Start by asking AI anything or uploading an image.',
      icon: <Rocket className="w-5 h-5 text-emerald-400" />,
      proTip: 'Click Continue to start creating amazing content!',
      celebration: true,
      priority: 1
    }
  ]

  const startTutorial = () => {
    console.log('🎯 Starting dashboard tour...')
    setIsActive(true)
    setCurrentStep(0)
    setElementFound(true)
    updateCurrentStep(tutorialSteps[0])
    playSound('start')
  }

  // Enhanced sidebar element finding
  const findTargetElement = useCallback((step: TutorialStep): HTMLElement | null => {
    if (!step.target || typeof document === 'undefined') return null
    
    try {
      const selectors = step.target.split(', ').map(s => s.trim()).filter(Boolean)
      console.log(`🔍 Searching for sidebar elements with selectors:`, selectors)
      
      // Sort selectors by priority (href selectors first for navigation)
      const prioritizedSelectors = selectors.sort((a, b) => {
        const aScore = (a.includes('href') ? 10 : 0) + (a.includes('[data-') ? 5 : 0)
        const bScore = (b.includes('href') ? 10 : 0) + (b.includes('[data-') ? 5 : 0)
        return bScore - aScore
      })
      
      for (const selector of prioritizedSelectors) {
        try {
          const element = document.querySelector(selector) as HTMLElement
          if (element && 
              element.offsetParent !== null && 
              element.getBoundingClientRect &&
              element.getBoundingClientRect().width > 0 && 
              element.getBoundingClientRect().height > 0) {
            console.log(`✅ Found sidebar element with selector: ${selector}`, element)
            return element
          } else if (element) {
            console.log(`⚠️ Found element but not visible with selector: ${selector}`)
          }
        } catch (selectorError) {
          console.log(`❌ Selector error for ${selector}:`, selectorError)
          continue // Try next selector
        }
      }
      
      console.log(`❌ No valid sidebar elements found for:`, step.target)
      return null
    } catch (error) {
      console.log('❌ Error in findTargetElement:', error)
      return null
    }
  }, [])

  const updateCurrentStep = async (step: TutorialStep) => {
    try {
      setIsAnimating(true)
      setElementFound(true)
      
      // Clear any existing timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      
      // No navigation - stay on dashboard and find sidebar elements
      if (step.target) {
        let retryCount = 0
        const maxRetries = 3
        
        const attemptFind = () => {
          try {
            const element = findTargetElement(step)
            
            if (element) {
              console.log(`✅ Found sidebar element on attempt ${retryCount + 1}:`, element)
              const rect = element.getBoundingClientRect()
              
              // Validate rect
              if (rect && rect.width > 0 && rect.height > 0) {
                setTargetRect(rect)
                setElementFound(true)
                
                // Smooth scroll to element
                try {
                  element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                  })
                } catch (scrollError) {
                  console.log('❌ Scroll error:', scrollError)
                }
                
                playSound('success')
                setIsAnimating(false)
                return true
              }
            }
            
            retryCount++
            console.log(`🎯 Sidebar element not found (attempt ${retryCount}/${maxRetries}):`, step.target)
            
            if (retryCount < maxRetries) {
              retryTimeoutRef.current = setTimeout(attemptFind, 500 * retryCount) // Shorter delays since no navigation
              return false
            } else {
              console.log('❌ Max retries reached, showing tutorial centered')
              setTargetRect(null)
              setElementFound(false)
              setIsAnimating(false)
              return true // Continue tutorial even without element
            }
          } catch (findError) {
            console.log('❌ Error in attemptFind:', findError)
            retryCount++
            if (retryCount < maxRetries) {
              retryTimeoutRef.current = setTimeout(attemptFind, 500 * retryCount)
            } else {
              console.log('❌ Giving up on element finding, showing tutorial centered')
              setTargetRect(null)
              setElementFound(false)
              setIsAnimating(false)
            }
            return false
          }
        }
        
        // Start finding immediately since we're on dashboard
        setTimeout(attemptFind, 300)
        
        // Safety timeout - always show tutorial after 3 seconds
        setTimeout(() => {
          if (isAnimating) {
            console.log('🔒 Safety timeout: forcing tutorial to show')
            setTargetRect(null)
            setElementFound(false)
            setIsAnimating(false)
          }
        }, 3000)
      } else {
        setTargetRect(null)
        setElementFound(true)
        setIsAnimating(false)
      }
    } catch (error) {
      console.log('❌ Error in updateCurrentStep:', error)
      setIsAnimating(false)
      setTargetRect(null)
      setElementFound(false)
    }
  }

  const currentStepData = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100
  const hasTarget = currentStepData.target && targetRect && elementFound
  const canGoBack = currentStep > 0 && !isAnimating
  const canGoForward = !isAnimating

  // FIXED: Enhanced positioning to prevent cut-off
  const getTooltipPosition = useCallback(() => {
    const tooltipWidth = 360
    const tooltipHeight = 280 // Reduced height to prevent cut-off
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 24
    const mobileBreakpoint = 1024

    // Mobile-first approach or no target - ALWAYS show tutorial
    if (viewportWidth < mobileBreakpoint || !targetRect || !hasTarget) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: `${Math.min(tooltipWidth, viewportWidth - padding * 2)}px`,
        maxHeight: `${Math.min(tooltipHeight, viewportHeight - padding * 2)}px`,
      }
    }

    // Safe access to targetRect
    const rect = targetRect
    if (!rect || rect.width === 0 || rect.height === 0) {
      // Fallback to center if rect is invalid
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: `${Math.min(tooltipWidth, viewportWidth - padding * 2)}px`,
        maxHeight: `${Math.min(tooltipHeight, viewportHeight - padding * 2)}px`,
      }
    }

    // Desktop positioning strategies - prioritize positions that keep modal in view
    const strategies = [
      // Strategy 1: Right side (preferred for sidebar)
      {
        top: Math.min(rect.top, viewportHeight - tooltipHeight - padding),
        left: rect.right + padding,
        score: rect.right + padding + tooltipWidth <= viewportWidth - padding ? 10 : 0
      },
      // Strategy 2: Center right
      {
        top: Math.max(padding, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - padding)),
        left: rect.right + padding,
        score: rect.right + padding + tooltipWidth <= viewportWidth - padding ? 9 : 0
      },
      // Strategy 3: Above target
      {
        top: Math.max(padding, rect.top - tooltipHeight - padding),
        left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - padding)),
        score: rect.top - tooltipHeight - padding >= padding ? 8 : 0
      },
      // Strategy 4: Below target
      {
        top: Math.min(rect.bottom + padding, viewportHeight - tooltipHeight - padding),
        left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - padding)),
        score: rect.bottom + padding + tooltipHeight <= viewportHeight - padding ? 7 : 0
      },
      // Strategy 5: Center screen (safe fallback)
      {
        top: Math.max(padding, (viewportHeight - tooltipHeight) / 2),
        left: Math.max(padding, (viewportWidth - tooltipWidth) / 2),
        score: 1 // Always available as fallback
      }
    ]

    // Find best strategy that keeps modal in viewport
    const bestStrategy = strategies
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)[0]

    const finalTop = Math.max(padding, Math.min(bestStrategy.top, viewportHeight - tooltipHeight - padding))
    const finalLeft = Math.max(padding, Math.min(bestStrategy.left, viewportWidth - tooltipWidth - padding))
    
    return {
      position: 'fixed' as const,
      top: `${finalTop}px`,
      left: `${finalLeft}px`,
      zIndex: 1000,
      width: `${Math.min(tooltipWidth, viewportWidth - padding * 2)}px`,
      maxHeight: `${Math.min(tooltipHeight, viewportHeight - padding * 2)}px`,
    }
  }, [targetRect, hasTarget])

  const nextStep = useCallback(() => {
    if (!isActive || isAnimating) return
    
    console.log(`✅ Advancing from step ${currentStep}`)
    playSound('step')
    
    if (tutorialSteps[currentStep].celebration) {
      setShowConfetti(true)
      playSound('celebration')
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    setTimeout(() => {
      if (!isActive) return
      
      if (currentStep < tutorialSteps.length - 1) {
        const nextStepIndex = currentStep + 1
        console.log(`🎯 Moving to step ${nextStepIndex}: ${tutorialSteps[nextStepIndex].title}`)
        setCurrentStep(nextStepIndex)
        updateCurrentStep(tutorialSteps[nextStepIndex])
      } else {
        console.log('🎉 Tour completed')
        closeTutorial()
      }
    }, 400)
  }, [currentStep, isActive, isAnimating])

  const prevStep = useCallback(() => {
    if (currentStep > 0 && !isAnimating) {
      const prevStepIndex = currentStep - 1
      console.log(`⬅️ Moving back to step ${prevStepIndex}`)
      setCurrentStep(prevStepIndex)
      updateCurrentStep(tutorialSteps[prevStepIndex])
      playSound('step')
    }
  }, [currentStep, isAnimating])

  const closeTutorial = useCallback(() => {
    console.log('✅ Closing dashboard tour')
    setShowConfetti(true)
    playSound('complete')
    
    // Clear all timeouts
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    
    setTimeout(() => {
      setIsActive(false)
      setTargetRect(null)
      setShowConfetti(false)
      setCurrentStep(0)
      setElementFound(true)
      
      if (onComplete) {
        console.log('🎯 Calling onComplete callback')
        onComplete()
      }
    }, 1500)
  }, [onComplete])

  const handleSkipClick = useCallback(() => {
    setShowSkipModal(true)
  }, [])

  const confirmSkip = useCallback(() => {
    setShowSkipModal(false)
    closeTutorial()
  }, [closeTutorial])

  const cancelSkip = useCallback(() => {
    setShowSkipModal(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  if (!isActive) return null

  return (
    <>
      {/* ✨ Enhanced celebration particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                animation: 'sparkle-float 4s ease-out forwards'
              }}
            >
              <div className={`text-2xl transform opacity-90`} 
                   style={{ rotate: `${Math.random() * 360}deg` }}>
                {['🎯', '⚡', '🚀', '💎', '🌟', '🎊', '🔥', '✨', '🏆', '🎨'][Math.floor(Math.random() * 10)]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎨 Enhanced overlay with perfect spotlight */}
      <div className="fixed inset-0 z-[999] transition-all duration-500">
        
        {/* FIXED: Clean spotlight effect with null checks */}
        {hasTarget && targetRect && targetRect.width > 0 && targetRect.height > 0 && (
          <>
            {/* Subtle overlay */}
            <div 
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                background: `radial-gradient(ellipse ${targetRect.width + 60}px ${targetRect.height + 60}px at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent 0%, transparent 30%, rgba(15, 23, 42, 0.4) 70%)`
              }}
            />
            
            {/* Clean highlight border */}
            <div 
              className="absolute border-3 border-blue-500 rounded-xl transition-all duration-700 ease-out"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)',
                animation: 'tutorial-clean-pulse 2s infinite',
              }}
            />
            
            {/* Inner highlight */}
            <div 
              className="absolute border-2 border-white/80 rounded-xl transition-all duration-700 ease-out"
              style={{
                top: targetRect.top - 2,
                left: targetRect.left - 2,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
              }}
            />
          </>
        )}

        {/* Enhanced tutorial modal */}
        <div 
          className={`absolute transition-all duration-500 ease-out ${
            isAnimating ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full">
            {/* Clean glassmorphic background */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200" />

            {/* Content */}
            <div className="relative p-5">
              {/* Clean header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-800 leading-tight mb-1">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        <span>Dashboard Tour</span>
                      </div>
                      {!elementFound && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Showing overview</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSkipClick}
                    className="group relative w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-300 hover:shadow-md hover:scale-105"
                    title="Skip tour"
                  >
                    <X className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors duration-200" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Enhanced content */}
              <div className="space-y-3 mb-4">
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {currentStepData.content}
                </p>
                
                {currentStepData.proTip && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                        <Brain className="w-3 h-3 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-amber-800 text-xs mb-1">💡 Pro Insight</div>
                        <p className="text-amber-700 text-xs font-medium leading-relaxed">
                          {currentStepData.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clean progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="text-blue-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Clean navigation */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSkipClick}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-full transition-all duration-200 shadow-sm border border-slate-300"
                  >
                    Skip Tour
                  </button>
                  
                  {canGoBack && (
                    <button
                      onClick={prevStep}
                      className="group flex items-center gap-1 px-2 py-1.5 text-slate-700 hover:text-slate-900 text-xs font-semibold bg-white hover:bg-slate-50 rounded-full transition-all duration-200 shadow-sm border border-slate-300"
                    >
                      <ChevronLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  disabled={!canGoForward}
                  className={`group flex items-center gap-2 px-4 py-1.5 text-white text-xs font-bold rounded-full transition-all duration-200 shadow-lg border ${
                    !canGoForward 
                      ? 'bg-slate-400 cursor-not-allowed opacity-60 border-slate-300' 
                      : 'bg-blue-600 hover:bg-blue-700 border-blue-500 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-3 h-3 transition-transform duration-200 group-hover:scale-110" strokeWidth={2.5} />
                      <span>Get Started!</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[1200] flex items-center justify-center backdrop-blur-xl p-4">
          <div className="relative max-w-md w-full">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
                  <Sparkles className="w-4 h-4 text-blue-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-800">Skip Dashboard Tour?</h3>
                  <p className="text-xs text-slate-600 font-medium">You can always restart it later</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium">
                This dashboard tour reveals powerful features that could
                <span className="font-bold text-slate-800"> save you hours</span> and 
                <span className="font-bold text-slate-800"> boost your productivity</span> dramatically.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border border-slate-300"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-full text-sm font-bold transition-all duration-200 shadow-lg border border-blue-500"
                >
                  Continue Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean CSS animations */}
      <style jsx global>{`
        @keyframes tutorial-clean-pulse {
          0%, 100% { 
            border-color: #3b82f6;
            transform: scale(1);
          }
          50% { 
            border-color: #1d4ed8;
            transform: scale(1.01);
          }
        }
        
        @keyframes sparkle-float {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(-60px) rotate(180deg) scale(1.2);
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-150px) rotate(360deg) scale(0.4);
            opacity: 0;
          }
        }
        
        @media (max-width: 1024px) {
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