'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, ChevronLeft, Star, Rocket, 
  Target, Brain, Palette, MessageCircle, Gift, Crown, Wand2, Play,
  ArrowDown, MousePointer, Eye, Navigation, Download, Share2, 
  Edit3, FileText, TrendingUp, Layers, Zap as Lightning
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
  features?: string[]
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
      console.log('🚀 Starting enhanced dashboard tour')
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

  // 🚀 ENHANCED TUTORIAL STEPS - EXPANDED & IMPROVED
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your AI Empire! 🎯',
      content: 'Ready to discover the most powerful AI content creation platform? This 2-minute tour will show you features that could revolutionize your entire workflow and save you 10+ hours per week!',
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      celebration: true,
      priority: 1,
      features: ['AI Content Generation', 'Team Collaboration', 'Smart Organization', 'Professional Growth']
    },
    {
      id: 'dashboard-features',
      title: 'Dashboard 🚀',
      content: 'This is your AI command center - the heart of your content empire! Upload any file type (images, PDFs, documents), chat with advanced AI models, generate stunning content, and download everything instantly. From blog posts to marketing campaigns, this is where magic happens.',
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      target: '[href="/dashboard"], a[href*="dashboard"], nav a:contains("Dashboard"), .nav-item:first-child',
      proTip: 'Try uploading a photo and asking AI to create social media posts, or paste a URL for instant content analysis!',
      priority: 1,
      features: ['Multi-format uploads', 'AI conversations', 'Instant downloads', 'Content generation']
    },
    {
      id: 'saved-responses',
      title: 'Saved Responses 💎',
      content: 'Your personal content treasure vault! Manually curate and save your favorite AI responses for future use. Create a growing library of templates, campaigns, and brilliant ideas. Pin your top performers, organize by projects, and never lose great content again. Build your content empire one save at a time!',
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
      target: '[href="/saved"], a[href*="saved"], nav a:contains("Saved Responses"), [data-nav="saved-responses"]',
      proTip: 'Save responses strategically - create templates for different content types and campaigns for maximum efficiency!',
      priority: 2,
      features: ['Manual curation', 'Template building', 'Project organization', 'Content library']
    },
    {
      id: 'gallery',
      title: 'Gallery 🎨',
      content: 'Your visual content powerhouse! Every AI-generated image becomes part of your growing brand library. Share directly to social media platforms with one click, download in multiple formats (PNG, JPG, SVG), organize by campaigns, and build a stunning visual brand presence that stands out.',
      icon: <Image className="w-6 h-6 text-purple-400" />,
      target: '[href="/gallery"], a[href*="gallery"], nav a:contains("Gallery"), [data-nav="gallery"]',
      proTip: 'Visual content gets 94% more engagement - use this to build a consistent visual brand across all platforms!',
      priority: 2,
      features: ['One-click social sharing', 'Multiple download formats', 'Campaign organization', 'Brand consistency']
    },
    {
      id: 'collab-zone',
      title: 'Collab Zone 🤝',
      content: 'Team collaboration reimagined! Share your Growfly AI responses instantly with colleagues, collaboratively edit documents in real-time, download team projects together, and watch your collective creativity multiply. Perfect for agencies, marketing teams, and any business wanting to scale their content creation through teamwork.',
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      target: '[href="/collab-zone"], a[href*="collab"], nav a:contains("Collab Zone"), [data-nav="collab-zone"]',
      proTip: 'Teams using collaborative AI are 3x more productive - assign roles, share feedback, and create better content together!',
      priority: 2,
      features: ['Real-time collaboration', 'Document editing', 'Team downloads', 'Shared workspaces']
    },
    {
      id: 'education-hub',
      title: 'Education Hub 🎓',
      content: 'Your AI mastery academy! Learn cutting-edge strategies, advanced prompting techniques, growth hacking methods, and industry secrets from top experts. Master the art of AI communication to 10x your results and stay ahead of 99% of businesses still struggling with basic content creation.',
      icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
      target: '[href="/education"], [href="/nerd-mode"], a[href*="education"], nav a:contains("Education Hub"), [data-nav="education-hub"]',
      proTip: 'Advanced AI strategies can 5x your content quality - invest 30 minutes learning here to save hours later!',
      priority: 2,
      features: ['Expert strategies', 'Advanced prompting', 'Growth techniques', 'Industry secrets']
    },
    {
      id: 'brand-settings',
      title: 'Brand Settings 🧬',
      content: 'Your AI personality laboratory! Input detailed information about your business, brand voice, target audience, industry, and unique selling propositions. The more you tell Growfly about your business, the more personalized, accurate, and brand-aligned every AI response becomes. Transform generic AI into your personal brand assistant.',
      icon: <Settings className="w-6 h-6 text-slate-600" />,
      target: '[href="/brand-settings"], a[href*="brand"], nav a:contains("Brand Settings"), [data-nav="brand-settings"]',
      proTip: 'Brands with consistent voice see 23% more revenue growth - spend 10 minutes here to revolutionize all your content!',
      priority: 2,
      features: ['Brand voice training', 'Audience targeting', 'Industry customization', 'Personalized responses']
    },
    {
      id: 'trusted-partners',
      title: 'Trusted Partners 💼',
      content: 'The future of AI + human collaboration! Coming soon - when AI gets you 90% of the way there, our verified network of professional editors, designers, strategists, and specialists can polish your work to absolute perfection. The perfect fusion of AI efficiency with human expertise for enterprise-level results.',
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      target: '[href="/trusted-partners"], a[href*="trusted"], nav a:contains("Trusted Partners"), [data-nav="trusted-partners"]',
      proTip: 'Early access members get 50% off professional services - join the waitlist for exclusive benefits!',
      priority: 3,
      features: ['Professional editors', 'Design specialists', 'Strategy experts', 'Enterprise polish']
    },
    {
      id: 'finale',
      title: 'Congratulations! You\'re Now AI-Powered! 🏆',
      content: 'You\'ve just unlocked the secret to 10x content creation! You now have access to AI superpowers that 99% of businesses don\'t even know exist. Time to dominate your industry with lightning-fast, professional-grade content that converts and captivates your audience!',
      icon: <Rocket className="w-6 h-6 text-emerald-400" />,
      proTip: 'Start with a simple prompt like "Create a social media campaign for my business" and watch the magic happen!',
      celebration: true,
      priority: 1,
      features: ['AI Mastery Unlocked', 'Competitive Advantage', 'Content Superpowers', 'Industry Domination']
    }
  ]

  const startTutorial = () => {
    console.log('🎯 Starting enhanced dashboard tour...')
    setIsActive(true)
    setCurrentStep(0)
    setElementFound(true)
    updateCurrentStep(tutorialSteps[0])
    playSound('start')
  }

  // FIXED: Enhanced sidebar element finding with better targeting
  const findTargetElement = useCallback((step: TutorialStep): HTMLElement | null => {
    if (!step.target || typeof document === 'undefined') return null
    
    try {
      const selectors = step.target.split(', ').map(s => s.trim()).filter(Boolean)
      console.log(`🔍 Searching for sidebar elements with selectors:`, selectors)
      
      // Enhanced priority system for better targeting
      const prioritizedSelectors = selectors.sort((a, b) => {
        let aScore = 0
        let bScore = 0
        
        // Prioritize exact href matches
        if (a.includes('href=')) aScore += 20
        if (b.includes('href=')) bScore += 20
        
        // Prioritize data attributes
        if (a.includes('[data-')) aScore += 15
        if (b.includes('[data-')) bScore += 15
        
        // Prioritize contains matches
        if (a.includes(':contains(')) aScore += 10
        if (b.includes(':contains(')) bScore += 10
        
        // Prioritize specific hrefs
        if (a.includes('href*=')) aScore += 5
        if (b.includes('href*=')) bScore += 5
        
        return bScore - aScore
      })
      
      for (const selector of prioritizedSelectors) {
        try {
          // Handle :contains() pseudo-selector manually since it's not standard CSS
          if (selector.includes(':contains(')) {
            const match = selector.match(/(.+):contains\(["'](.+)["']\)/)
            if (match) {
              const [, baseSelector, text] = match
              const elements = document.querySelectorAll(baseSelector)
              for (const el of elements) {
                if (el.textContent?.includes(text)) {
                  const element = el as HTMLElement
                  if (element && 
                      element.offsetParent !== null && 
                      element.getBoundingClientRect &&
                      element.getBoundingClientRect().width > 0 && 
                      element.getBoundingClientRect().height > 0) {
                    console.log(`✅ Found sidebar element with contains selector: ${selector}`, element)
                    return element
                  }
                }
              }
            }
          } else {
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
        const maxRetries = 4
        
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
              retryTimeoutRef.current = setTimeout(attemptFind, 600 * retryCount) // Longer delays for better reliability
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
              retryTimeoutRef.current = setTimeout(attemptFind, 600 * retryCount)
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
        setTimeout(attemptFind, 400)
        
        // Safety timeout - always show tutorial after 5 seconds
        setTimeout(() => {
          if (isAnimating) {
            console.log('🔒 Safety timeout: forcing tutorial to show')
            setTargetRect(null)
            setElementFound(false)
            setIsAnimating(false)
          }
        }, 5000)
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

  // ENHANCED: Premium positioning with better design
  const getTooltipPosition = useCallback(() => {
    const tooltipWidth = 480
    const tooltipHeight = 420
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 32
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
      setTimeout(() => setShowConfetti(false), 4000)
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
    }, 500)
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
    console.log('✅ Closing enhanced dashboard tour')
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
    }, 2000)
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
      {/* ✨ ENHANCED: Epic celebration particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                animation: 'epic-float 6s ease-out forwards'
              }}
            >
              <div className={`text-4xl transform opacity-90`} 
                   style={{ rotate: `${Math.random() * 360}deg` }}>
                {['🎯', '⚡', '🚀', '💎', '🌟', '🎊', '🔥', '✨', '🏆', '🎨', '💡', '🎭', '🦄', '💫', '⭐'][Math.floor(Math.random() * 15)]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎨 ENHANCED: Epic overlay with premium spotlight */}
      <div className="fixed inset-0 z-[999] transition-all duration-700">
        
        {/* ENHANCED: Premium spotlight effect with dynamic animations */}
        {hasTarget && targetRect && targetRect.width > 0 && targetRect.height > 0 && (
          <>
            {/* Dynamic premium gradient overlay */}
            <div 
              className="absolute inset-0 transition-all duration-1200 ease-out"
              style={{
                background: `radial-gradient(ellipse ${targetRect.width + 120}px ${targetRect.height + 120}px at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent 0%, transparent 20%, rgba(6, 17, 39, 0.7) 65%)`
              }}
            />
            
            {/* Epic animated tech border */}
            <div 
              className="absolute rounded-3xl transition-all duration-1200 ease-out"
              style={{
                top: targetRect.top - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #3b82f6)',
                backgroundSize: '400% 400%',
                animation: 'epic-tech-flow 4s ease infinite',
                padding: '4px',
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.9), 0 0 80px rgba(139, 92, 246, 0.5), 0 0 120px rgba(6, 182, 212, 0.3)',
              }}
            >
              <div 
                className="w-full h-full bg-transparent rounded-3xl"
                style={{
                  backdropFilter: 'blur(3px)',
                  background: 'rgba(255, 255, 255, 0.08)'
                }}
              />
            </div>
            
            {/* Premium inner glow ring */}
            <div 
              className="absolute border-3 border-white/90 rounded-3xl transition-all duration-1200 ease-out"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 255, 255, 0.3)',
                animation: 'premium-glow 3s ease infinite'
              }}
            />
          </>
        )}

        {/* 🚀 ENHANCED: Premium tutorial modal with epic design */}
        <div 
          className={`absolute transition-all duration-700 ease-out ${
            isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
          }`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full">
            {/* Epic glassmorphic background with animated gradient border */}
            <div className="absolute inset-0 rounded-[2rem] p-1" style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #3b82f6)',
              backgroundSize: '300% 300%',
              animation: 'epic-gradient-shift 6s ease infinite'
            }}>
              <div className="w-full h-full bg-white/96 backdrop-blur-3xl rounded-[2rem] border border-white/40 shadow-2xl" />
            </div>

            {/* Content */}
            <div className="relative p-8">
              {/* Epic enhanced header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-emerald-500/30 rounded-3xl animate-pulse" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 rounded-3xl flex items-center justify-center shadow-2xl border border-white/60">
                      <div className="relative">
                        {currentStepData.icon}
                        {currentStepData.celebration && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    {currentStepData.celebration && (
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl animate-ping" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-2">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>Premium Tour</span>
                      </div>
                      {!elementFound && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Overview Mode</span>
                        </>
                      )}
                      {currentStepData.celebration && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold animate-pulse">🎉 Milestone!</span>
                        </>
                      )}
                    </div>
                    {currentStepData.features && (
                      <div className="flex flex-wrap gap-2">
                        {currentStepData.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-xs font-medium text-blue-700 rounded-full border border-blue-200/50">
                            <Lightning className="w-3 h-3 mr-1" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleSkipClick}
                  className="group relative w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border border-white/70 hover:shadow-2xl hover:scale-110"
                  title="Skip tour"
                >
                  <X className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors duration-200" strokeWidth={2} />
                </button>
              </div>

              {/* Epic enhanced content */}
              <div className="space-y-5 mb-7">
                <p className="text-slate-700 text-lg leading-relaxed font-medium">
                  {currentStepData.content}
                </p>
                
                {currentStepData.proTip && (
                  <div className="relative overflow-hidden p-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200/70 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-yellow-500/8 to-orange-500/8" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-amber-800 text-base mb-2 flex items-center gap-2">
                          💡 Pro Insight
                          <Star className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-amber-700 text-base font-medium leading-relaxed">
                          {currentStepData.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Epic enhanced progress with premium animation */}
              <div className="mb-7">
                <div className="flex justify-between text-base font-bold mb-4">
                  <span className="text-slate-700">Step {currentStep + 1} of {tutorialSteps.length}</span>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="relative w-full h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-0 rounded-full transition-all duration-1500 ease-out shadow-xl"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #f59e0b)',
                      backgroundSize: '300% 300%',
                      animation: 'epic-gradient-shift 4s ease infinite'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full" />
                  </div>
                </div>
              </div>

              {/* Epic enhanced navigation */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSkipClick}
                    className="px-6 py-3 text-slate-600 hover:text-slate-800 text-base font-bold bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-full transition-all duration-300 shadow-xl border border-white/70 hover:shadow-2xl hover:scale-105"
                  >
                    Skip Tour
                  </button>
                  
                  {canGoBack && (
                    <button
                      onClick={prevStep}
                      className="group flex items-center gap-2 px-5 py-3 text-slate-700 hover:text-slate-900 text-base font-bold bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 rounded-full transition-all duration-300 shadow-xl border border-white/80 hover:shadow-2xl hover:scale-105"
                    >
                      <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2.5} />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  disabled={!canGoForward}
                  className={`group relative flex items-center gap-3 px-8 py-3 text-white text-base font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl border border-white/40 ${
                    !canGoForward 
                      ? 'bg-gradient-to-br from-slate-400 to-slate-500 cursor-not-allowed opacity-60' 
                      : 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 hover:scale-110'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-6 h-6 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12" strokeWidth={2.5} />
                      <span className="relative z-10">Start Dominating!</span>
                      <Lightning className="w-5 h-5 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Continue</span>
                      <ChevronRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Epic enhanced skip confirmation modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/95 z-[1200] flex items-center justify-center backdrop-blur-3xl p-4">
          <div className="relative max-w-2xl w-full">
            <div className="absolute inset-0 rounded-3xl p-1" style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #10b981)',
              backgroundSize: '300% 300%',
              animation: 'epic-gradient-shift 4s ease infinite'
            }}>
              <div className="w-full h-full bg-white/96 backdrop-blur-3xl rounded-3xl border border-white/40 shadow-2xl" />
            </div>

            <div className="relative p-8">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 rounded-3xl flex items-center justify-center shadow-2xl border border-white/70">
                  <Sparkles className="w-8 h-8 text-blue-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">Skip This Epic Tour?</h3>
                  <p className="text-base text-slate-600 font-medium">You can restart anytime from Settings → Tutorial</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-lg mb-8 leading-relaxed font-medium">
                This premium tour reveals game-changing features that could
                <span className="font-bold text-slate-800"> save you 10+ hours per week</span> and 
                <span className="font-bold text-slate-800"> give you massive competitive advantages</span> in your industry.
              </p>
              
              <div className="flex gap-5">
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 hover:text-slate-800 py-4 px-6 rounded-full text-base font-bold transition-all duration-300 shadow-xl border border-white/70 hover:shadow-2xl hover:scale-105"
                >
                  Skip
                </button>
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white py-4 px-6 rounded-full text-base font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl border border-white/40 relative overflow-hidden hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
                  <span className="relative z-10">Continue Epic Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Epic CSS animations */}
      <style jsx global>{`
        @keyframes epic-tech-flow {
          0%, 100% { 
            background-position: 0% 50%;
            transform: scale(1);
          }
          50% { 
            background-position: 100% 50%;
            transform: scale(1.03);
          }
        }
        
        @keyframes epic-gradient-shift {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          33% { 
            background-position: 100% 0%; 
          }
          66% { 
            background-position: 100% 100%; 
          }
        }
        
        @keyframes premium-glow {
          0%, 100% { 
            box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 255, 255, 0.3);
          }
          50% { 
            box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.6), 0 0 35px rgba(255, 255, 255, 0.5);
          }
        }
        
        @keyframes epic-float {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(0.6);
            opacity: 1;
          }
          50% {
            transform: translateY(-120px) rotate(180deg) scale(1.4);
            opacity: 0.9;
          }
          100% { 
            transform: translateY(-300px) rotate(360deg) scale(0.2);
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