'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, ChevronLeft, Star, Rocket, 
  Target, Brain, Palette, MessageCircle, Gift, Crown, Wand2, Play,
  ArrowDown, MousePointer, Eye, Navigation, Download, Share2
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
  priority?: number
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

  // ✅ Start tutorial when prop changes with safety checks
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

  // 🚀 FIXED TUTORIAL STEPS - ALL 6 CHANGES IMPLEMENTED
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Growfly! 🎯',
      content: 'Ready for a quick tour? Let me show you the power zones that will transform your content creation!',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      celebration: true,
      priority: 1
    },
    {
      id: 'dashboard-features',
      title: 'Dashboard 🚀',
      content: 'You\'re in the AI command center! Upload images, chat with AI, get instant results. This is where the magic happens.',
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      target: '[href="/dashboard"], a[href*="dashboard"], nav a:contains("Dashboard"), .nav-item:first-child',
      proTip: 'Upload any file type - images, PDFs, documents - and ask AI to transform them!',
      priority: 1
    },
    {
      id: 'saved-responses',
      title: 'Saved Responses 💎',
      content: 'Your personal content vault! Manually save your favorite Growfly responses to review, share, and download later. Pin your top responses so you never miss your best content!',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      target: '[href="/saved"], a[href*="saved"], nav a:contains("Saved"), [data-nav="saved-responses"]',
      proTip: 'Remember: You control what gets saved - manually save your best responses from the dashboard!',
      priority: 2
    },
    {
      id: 'gallery',
      title: 'Gallery 🎨',
      content: 'Your visual content hub! Share to socials, download for presentations, and organize all your AI-generated images. One-click sharing and instant downloads.',
      icon: <Image className="w-5 h-5 text-purple-400" />,
      target: '[href="/gallery"], a[href*="gallery"], nav a:contains("Gallery"), [data-nav="gallery"]',
      proTip: 'Share directly to social media and download in multiple formats - perfect for any platform!',
      priority: 2
    },
    {
      id: 'collab-zone',
      title: 'Collab Zone 🤝',
      content: 'Share your Growfly responses with colleagues to collaborate! Work together on documents, edit, improve, and make them even better as a team.',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      target: '[href="/collab-zone"], a[href*="collab"], nav a:contains("Collab"), [data-nav="collab-zone"]',
      proTip: 'Perfect for agencies and teams - real-time collaboration on AI-generated content!',
      priority: 2
    },
    {
      id: 'education-hub',
      title: 'Education Hub 🎓',
      content: 'Master advanced AI strategies and growth techniques from experts to maximize your Growfly results. Learn prompting secrets that 10x your output!',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      target: '[href="/education"], [href="/nerd-mode"], a[href*="education"], nav a:contains("Education"), [data-nav="education-hub"]',
      proTip: 'Advanced AI strategies can 5x your content quality - learn from the pros!',
      priority: 2
    },
    {
      id: 'brand-settings',
      title: 'Brand Settings 🧬',
      content: 'Input as many details as you want about your business and brand to get incredibly unique responses from Growfly. We learn about you and your business to tailor our responses perfectly.',
      icon: <Settings className="w-5 h-5 text-slate-600" />,
      target: '[href="/brand-settings"], a[href*="brand"], nav a:contains("Brand"), [data-nav="brand-settings"]',
      proTip: 'The more you tell us about your business, the more personalized and accurate your AI responses become!',
      priority: 2
    },
    {
      id: 'trusted-partners',
      title: 'Trusted Partners 💼',
      content: 'Coming soon! For when AI can\'t take you that final step, our trusted partners can provide human expertise to perfect your work to professional standards.',
      icon: <Crown className="w-5 h-5 text-yellow-500" />,
      target: '[href="/trusted-partners"], a[href*="trusted"], nav a:contains("Trusted"), [data-nav="trusted-partners"]',
      proTip: 'Professional editors, designers, and strategists ready to polish your AI content to perfection!',
      priority: 3
    },
    {
      id: 'finale',
      title: 'Ready to Create Magic! 🏆',
      content: 'You\'re all set! Now you know where everything is and how to maximize Growfly\'s power. Time to create amazing content!',
      icon: <Rocket className="w-5 h-5 text-emerald-400" />,
      proTip: 'Start with the dashboard and experiment - the best way to learn is by doing!',
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

  // ENHANCED: Cool positioning with better design
  const getTooltipPosition = useCallback(() => {
    const tooltipWidth = 420
    const tooltipHeight = 300
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
          {[...Array(60)].map((_, i) => (
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
              <div className={`text-3xl transform opacity-90`} 
                   style={{ rotate: `${Math.random() * 360}deg` }}>
                {['🎯', '⚡', '🚀', '💎', '🌟', '🎊', '🔥', '✨', '🏆', '🎨', '💡', '🎭'][Math.floor(Math.random() * 12)]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎨 ENHANCED: Modern overlay with cool spotlight */}
      <div className="fixed inset-0 z-[999] transition-all duration-500">
        
        {/* ENHANCED: Cool spotlight effect with animated borders */}
        {hasTarget && targetRect && targetRect.width > 0 && targetRect.height > 0 && (
          <>
            {/* Dynamic gradient overlay */}
            <div 
              className="absolute inset-0 transition-all duration-1000 ease-out"
              style={{
                background: `radial-gradient(ellipse ${targetRect.width + 100}px ${targetRect.height + 100}px at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent 0%, transparent 25%, rgba(6, 17, 39, 0.6) 70%)`
              }}
            />
            
            {/* Animated tech border */}
            <div 
              className="absolute rounded-2xl transition-all duration-1000 ease-out"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #3b82f6)',
                backgroundSize: '300% 300%',
                animation: 'tech-flow 3s ease infinite',
                padding: '3px',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.4)',
              }}
            >
              <div 
                className="w-full h-full bg-transparent rounded-2xl"
                style={{
                  backdropFilter: 'blur(2px)',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              />
            </div>
            
            {/* Inner glow ring */}
            <div 
              className="absolute border-2 border-white/80 rounded-2xl transition-all duration-1000 ease-out"
              style={{
                top: targetRect.top - 3,
                left: targetRect.left - 3,
                width: targetRect.width + 6,
                height: targetRect.height + 6,
                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.2)',
              }}
            />
          </>
        )}

        {/* 🚀 ENHANCED: Modern tutorial modal with cool design */}
        <div 
          className={`absolute transition-all duration-500 ease-out ${
            isAnimating ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full">
            {/* Modern glassmorphic background with gradient border */}
            <div className="absolute inset-0 rounded-3xl p-0.5" style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #10b981)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 4s ease infinite'
            }}>
              <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl" />
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Enhanced header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl animate-pulse" />
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 rounded-2xl flex items-center justify-center shadow-xl border border-white/50">
                      <div className="relative">
                        {currentStepData.icon}
                        {currentStepData.celebration && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Star className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-1">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>Interactive Tour</span>
                      </div>
                      {!elementFound && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Overview Mode</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleSkipClick}
                  className="group relative w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-white/60 hover:shadow-xl hover:scale-105"
                  title="Skip tour"
                >
                  <X className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors duration-200" strokeWidth={2} />
                </button>
              </div>

              {/* Enhanced content */}
              <div className="space-y-4 mb-6">
                <p className="text-slate-700 text-base leading-relaxed font-medium">
                  {currentStepData.content}
                </p>
                
                {currentStepData.proTip && (
                  <div className="relative overflow-hidden p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200/60 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5" />
                    <div className="relative flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-1">
                          💡 Pro Insight
                          <Star className="w-3 h-3 text-amber-600" />
                        </div>
                        <p className="text-amber-700 text-sm font-medium leading-relaxed">
                          {currentStepData.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced progress with animation */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-3">
                  <span className="text-slate-700">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="relative w-full h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-0 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #10b981)',
                      backgroundSize: '200% 200%',
                      animation: 'gradient-shift 3s ease infinite'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full" />
                  </div>
                </div>
              </div>

              {/* Enhanced navigation */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkipClick}
                    className="px-5 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-bold bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-full transition-all duration-300 shadow-lg border border-white/60 hover:shadow-xl hover:scale-105"
                  >
                    Skip Tour
                  </button>
                  
                  {canGoBack && (
                    <button
                      onClick={prevStep}
                      className="group flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:text-slate-900 text-sm font-bold bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 rounded-full transition-all duration-300 shadow-lg border border-white/70 hover:shadow-xl hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  disabled={!canGoForward}
                  className={`group relative flex items-center gap-3 px-7 py-2.5 text-white text-sm font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/30 ${
                    !canGoForward 
                      ? 'bg-gradient-to-br from-slate-400 to-slate-500 cursor-not-allowed opacity-60' 
                      : 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 hover:scale-105'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={2.5} />
                      <span className="relative z-10">Start Creating!</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Continue</span>
                      <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-[1200] flex items-center justify-center backdrop-blur-2xl p-4">
          <div className="relative max-w-lg w-full">
            <div className="absolute inset-0 rounded-3xl p-0.5" style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite'
            }}>
              <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl" />
            </div>

            <div className="relative p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 rounded-2xl flex items-center justify-center shadow-lg border border-white/60">
                  <Sparkles className="w-6 h-6 text-blue-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">Skip Tour?</h3>
                  <p className="text-sm text-slate-600 font-medium">You can restart anytime from Settings</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-base mb-6 leading-relaxed font-medium">
                This tour reveals powerful features that could
                <span className="font-bold text-slate-800"> save you hours</span> and 
                <span className="font-bold text-slate-800"> transform your workflow</span> completely.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 hover:text-slate-800 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg border border-white/60 hover:shadow-xl hover:scale-105"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/30 relative overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                  <span className="relative z-10">Continue Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS animations */}
      <style jsx global>{`
        @keyframes tech-flow {
          0%, 100% { 
            background-position: 0% 50%;
            transform: scale(1);
          }
          50% { 
            background-position: 100% 50%;
            transform: scale(1.02);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }
        
        @keyframes sparkle-float {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(0.7);
            opacity: 1;
          }
          50% {
            transform: translateY(-80px) rotate(180deg) scale(1.3);
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-200px) rotate(360deg) scale(0.3);
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