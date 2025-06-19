'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Zap, BookOpen, Image, 
  Users, Settings, Play, CheckCircle, Sparkles, ArrowRight, Heart
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
  target?: string
  explanation?: string
}

const GrowflyTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [elementFound, setElementFound] = useState(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)

  // Initialize tutorial
  useEffect(() => {
    if (isFirstTime) {
      // Ensure DOM is ready
      setTimeout(() => {
        document.body.style.overflow = 'hidden'
        document.body.style.userSelect = 'none'
        setIsActive(true)
        setCurrentStep(0)
      }, 100)
    }
  }, [isFirstTime])

  // Cleanup
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.body.style.userSelect = ''
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  // Tutorial steps with bulletproof targeting
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Growfly',
      content: 'Your intelligent AI assistant is ready to transform how you work. Let\'s explore the key features that will boost your productivity.',
      icon: <Sparkles className="w-6 h-6" />,
      explanation: 'This quick tour will show you exactly how to use each section effectively.'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      content: 'Your central workspace for AI conversations, file uploads, and content generation.',
      icon: <Zap className="w-5 h-5" />,
      target: 'dashboard',
      explanation: 'Start conversations, upload files, and generate content here. This is your main workspace.'
    },
    {
      id: 'collab-zone',
      title: 'Collab Zone',
      content: 'Collaborate with team members and share AI-generated insights across your organisation.',
      icon: <Users className="w-5 h-5" />,
      target: 'collab-zone',
      explanation: 'Work together on projects and share knowledge with your team members.'
    },
    {
      id: 'saved-responses',
      title: 'Saved Responses',
      content: 'Your personal library of AI outputs, templates, and reusable content.',
      icon: <BookOpen className="w-5 h-5" />,
      target: 'saved-responses',
      explanation: 'Save your best outputs as templates to maintain consistency and speed up future work.'
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      content: 'Keep track of ideas, inspiration, and future projects you want to explore.',
      icon: <Heart className="w-5 h-5" />,
      target: 'wishlist',
      explanation: 'Never lose a brilliant idea again. Store inspiration for future projects here.'
    },
    {
      id: 'gallery',
      title: 'Gallery',
      content: 'Browse, organise, and manage all your AI-generated images and visual content.',
      icon: <Image className="w-5 h-5" />,
      target: 'gallery',
      explanation: 'All your visual content in one organised space. Download, share, and manage images easily.'
    },
    {
      id: 'complete',
      title: 'You\'re Ready to Go!',
      content: 'Your AI assistant is now ready to help you create amazing content and boost your productivity. Start exploring!',
      icon: <CheckCircle className="w-6 h-6" />,
      explanation: 'Begin with any section that interests you most. Your AI-powered journey starts now!'
    }
  ]

  // Bulletproof element finder with multiple strategies
  const findTargetElement = useCallback((targetId: string): HTMLElement | null => {
    if (!targetId) return null

    // Strategy 1: Direct href matching (most reliable)
    const hrefSelectors = [
      `a[href="/${targetId}"]`,
      `a[href*="/${targetId}"]`,
      `[href="/${targetId}"]`,
      `[href*="/${targetId}"]`
    ]

    for (const selector of hrefSelectors) {
      try {
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
        const visibleElement = elements.find(el => {
          const rect = el.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0 && el.offsetParent !== null
        })
        if (visibleElement) return visibleElement
      } catch {}
    }

    // Strategy 2: Text content matching
    const textSelectors = ['a', 'button', 'nav a', '.sidebar a', '[role="menuitem"]']
    const searchTexts = {
      'dashboard': ['Dashboard', 'dashboard'],
      'collab-zone': ['Collab Zone', 'Collab', 'Collaboration'],
      'saved-responses': ['Saved Responses', 'Saved', 'saved'],
      'wishlist': ['Wishlist', 'wishlist'],
      'gallery': ['Gallery', 'gallery']
    }

    const textsToSearch = searchTexts[targetId as keyof typeof searchTexts] || []
    
    for (const selector of textSelectors) {
      try {
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
        for (const text of textsToSearch) {
          const element = elements.find(el => {
            const hasText = el.textContent?.trim().toLowerCase().includes(text.toLowerCase())
            const rect = el.getBoundingClientRect()
            const isVisible = rect.width > 0 && rect.height > 0 && el.offsetParent !== null
            return hasText && isVisible
          })
          if (element) return element
        }
      } catch {}
    }

    // Strategy 3: Data attributes and classes
    const attributeSelectors = [
      `[data-testid*="${targetId}"]`,
      `[data-page="${targetId}"]`,
      `[class*="${targetId}"]`,
      `[id*="${targetId}"]`
    ]

    for (const selector of attributeSelectors) {
      try {
        const element = document.querySelector(selector) as HTMLElement
        if (element?.offsetParent) return element
      } catch {}
    }

    return null
  }, [])

  // Enhanced target element updater with observer
  const updateTargetElement = useCallback((step: TutorialStep) => {
    if (!step.target) {
      setTargetRect(null)
      setElementFound(true)
      return
    }

    setElementFound(false)
    let attempts = 0
    const maxAttempts = 8

    const findAndSetTarget = () => {
      const element = findTargetElement(step.target!)
      
      if (element) {
        // Double-check element is still visible
        setTimeout(() => {
          if (element.offsetParent) {
            const rect = element.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
              setTargetRect(rect)
              setElementFound(true)
              
              // Gentle scroll to element
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              })
              return
            }
          }
          
          // Element became invisible, retry
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(findAndSetTarget, 300)
          } else {
            setTargetRect(null)
            setElementFound(false)
          }
        }, 100)
        return
      }
      
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(findAndSetTarget, 200 + (attempts * 100))
      } else {
        setTargetRect(null)
        setElementFound(false)
      }
    }

    // Start finding after a brief delay
    setTimeout(findAndSetTarget, 150)

    // Set up observer for DOM changes (throttled for performance)
    if (observerRef.current) observerRef.current.disconnect()
    
    if (attempts < 3) { // Only observe for first few attempts
      observerRef.current = new MutationObserver(() => {
        if (!elementFound && attempts < maxAttempts) {
          setTimeout(findAndSetTarget, 100) // Throttled
        }
      })

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: false, // Reduced scope for performance
        attributes: false // Disable attribute watching for performance
      })
    }
  }, [findTargetElement, elementFound])

  // Update target when step changes
  useEffect(() => {
    if (isActive) {
      setIsAnimating(true)
      updateTargetElement(tutorialSteps[currentStep])
      setTimeout(() => setIsAnimating(false), 400)
    }
  }, [currentStep, isActive, updateTargetElement])

  const currentStepData = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1
  const isWelcomeStep = currentStepData.id === 'welcome'
  const isCompleteStep = currentStepData.id === 'complete'
  const hasTarget = currentStepData.target && targetRect && elementFound
  const isMobile = window.innerWidth < 768

  // Bulletproof positioning system
  const getModalPosition = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isMobile = vw < 768
    const isSmallMobile = vw < 400
    
    // Responsive sizing
    const baseWidth = isSmallMobile ? 340 : isMobile ? 380 : 440
    const baseHeight = isSmallMobile ? 280 : isMobile ? 300 : 320
    const padding = isSmallMobile ? 16 : isMobile ? 18 : 20

    // Ensure minimum viable size with better mobile handling
    const modalWidth = Math.min(baseWidth, vw - padding * 2)
    const modalHeight = Math.min(baseHeight, vh - padding * 2)

    // Welcome/Complete or no target - center with animation
    if (isWelcomeStep || isCompleteStep || !hasTarget || !targetRect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${modalWidth}px`,
        maxHeight: `${modalHeight}px`,
        zIndex: 1001
      }
    }

    // Calculate optimal position relative to target
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2

    // Position strategies in order of preference
    const strategies = [
      // Right of target (ideal for sidebar navigation)
      {
        name: 'right',
        top: Math.max(padding, Math.min(targetCenterY - modalHeight / 2, vh - modalHeight - padding)),
        left: targetRect.right + 20,
        isValid: () => targetRect.right + 20 + modalWidth <= vw - padding
      },
      // Left of target
      {
        name: 'left',
        top: Math.max(padding, Math.min(targetCenterY - modalHeight / 2, vh - modalHeight - padding)),
        left: targetRect.left - modalWidth - 20,
        isValid: () => targetRect.left - modalWidth - 20 >= padding
      },
      // Below target
      {
        name: 'below',
        top: Math.min(targetRect.bottom + 20, vh - modalHeight - padding),
        left: Math.max(padding, Math.min(targetCenterX - modalWidth / 2, vw - modalWidth - padding)),
        isValid: () => targetRect.bottom + 20 + modalHeight <= vh - padding
      },
      // Above target
      {
        name: 'above',
        top: Math.max(padding, targetRect.top - modalHeight - 20),
        left: Math.max(padding, Math.min(targetCenterX - modalWidth / 2, vw - modalWidth - padding)),
        isValid: () => targetRect.top - modalHeight - 20 >= padding
      },
      // Fallback: center screen
      {
        name: 'center',
        top: Math.max(padding, (vh - modalHeight) / 2),
        left: Math.max(padding, (vw - modalWidth) / 2),
        isValid: () => true
      }
    ]

    // Find first valid strategy
    const strategy = strategies.find(s => s.isValid()) || strategies[strategies.length - 1]

    return {
      position: 'fixed' as const,
      top: `${strategy.top}px`,
      left: `${strategy.left}px`,
      width: `${modalWidth}px`,
      maxHeight: `${modalHeight}px`,
      zIndex: 1001
    }
  }, [targetRect, hasTarget, isWelcomeStep, isCompleteStep])

  // Navigation functions
  const nextStep = useCallback(() => {
    if (isLastStep) {
      closeTutorial()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [isLastStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const closeTutorial = useCallback(() => {
    setIsActive(false)
    setCurrentStep(0)
    setTargetRect(null)
    document.body.style.overflow = ''
    document.body.style.userSelect = ''
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    if (observerRef.current) observerRef.current.disconnect()
    onComplete?.()
  }, [onComplete])

  const handleSkip = useCallback(() => setShowSkipModal(true), [])
  const confirmSkip = useCallback(() => {
    setShowSkipModal(false)
    closeTutorial()
  }, [closeTutorial])

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts during tutorial
      if (['Space', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) {
        e.preventDefault()
      }

      switch (e.code) {
        case 'Escape':
          handleSkip()
          break
        case 'ArrowRight':
        case 'Space':
        case 'Enter':
          nextStep()
          break
        case 'ArrowLeft':
          prevStep()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [isActive, nextStep, prevStep, handleSkip])

  if (!isActive) return null

  return (
    <>
      {/* Main Overlay Container */}
      <div className="fixed inset-0 z-50 select-none">
        
        {/* Welcome/Complete: Premium Animated Background */}
        {(isWelcomeStep || isCompleteStep) && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/20 to-purple-600/30 animate-pulse" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }} />
            </div>
          </div>
        )}
        
        {/* Navigation Steps: Enhanced Spotlight System */}
        {!isWelcomeStep && !isCompleteStep && (
          <>
            {/* Base dark overlay */}
            <div className="absolute inset-0 bg-black/75 transition-all duration-500" />
            
            {/* Spotlight and highlighting */}
            {hasTarget && targetRect && (
              <>
                {/* Main spotlight effect */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    background: `radial-gradient(ellipse ${Math.max(targetRect.width + 100, 200)}px ${Math.max(targetRect.height + 100, 200)}px at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent 0%, transparent 25%, rgba(0, 0, 0, 0.85) 70%)`
                  }}
                />
                
                {/* Animated gradient border - simplified for performance */}
                <div 
                  className="absolute pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    top: targetRect.top - (isMobile ? 8 : 12),
                    left: targetRect.left - (isMobile ? 8 : 12),
                    width: targetRect.width + (isMobile ? 16 : 24),
                    height: targetRect.height + (isMobile ? 16 : 24),
                    borderRadius: isMobile ? '12px' : '16px',
                    background: isMobile ? '#3B82F6' : 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
                    backgroundSize: isMobile ? '100% 100%' : '400% 400%',
                    padding: '3px',
                    animation: isMobile ? 'none' : 'gradient-border 4s ease infinite'
                  }}
                >
                  <div 
                    className="w-full h-full bg-transparent rounded-xl"
                    style={{ borderRadius: isMobile ? '9px' : '12px' }}
                  />
                </div>
                
                {/* Inner glow ring */}
                <div 
                  className="absolute pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    top: targetRect.top - 6,
                    left: targetRect.left - 6,
                    width: targetRect.width + 12,
                    height: targetRect.height + 12,
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                    animation: 'glow-pulse 2s ease-in-out infinite alternate'
                  }}
                />
                
                {/* Subtle inner highlight */}
                <div 
                  className="absolute pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    top: targetRect.top - 2,
                    left: targetRect.left - 2,
                    width: targetRect.width + 4,
                    height: targetRect.height + 4,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              </>
            )}
          </>
        )}

        {/* Tutorial Modal */}
        <div 
          style={getModalPosition()}
          className={`transition-all duration-500 ease-out ${
            isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
          }`}
        >
          <div className={`rounded-2xl shadow-2xl overflow-hidden border-2 backdrop-fallback ${
            isWelcomeStep || isCompleteStep 
              ? 'bg-white/98 border-white/30 shadow-white/20' 
              : 'bg-white border-gray-200'
          }`} style={{ 
            backdropFilter: 'blur(12px)', 
            WebkitBackdropFilter: 'blur(12px)' 
          }}>
            
            {/* Header Section */}
            <div className={`relative overflow-hidden ${
              isWelcomeStep || isCompleteStep 
                ? 'bg-gradient-to-r from-white/20 to-white/10 border-b border-white/20' 
                : 'bg-gradient-to-r from-gray-50 to-white border-b border-gray-100'
            }`}>
              
              {/* Animated background for special steps */}
              {(isWelcomeStep || isCompleteStep) && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 animate-gradient-x" />
              )}
              
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-lg ${
                      isWelcomeStep || isCompleteStep
                        ? 'bg-white/20 border-white/40 text-white backdrop-blur-sm shadow-white/20'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 text-blue-600'
                    }`}>
                      {currentStepData.icon}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold tracking-tight ${
                        isWelcomeStep || isCompleteStep ? 'text-white' : 'text-gray-900'
                      }`}>
                        {currentStepData.title}
                      </h3>
                      <p className={`text-sm font-medium ${
                        isWelcomeStep || isCompleteStep ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        Step {currentStep + 1} of {tutorialSteps.length} • Growfly Tutorial
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSkip}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                      isWelcomeStep || isCompleteStep
                        ? 'hover:bg-white/20 text-white/70 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label="Skip tutorial"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="mb-6">
                <p className={`text-base leading-relaxed mb-4 ${
                  isWelcomeStep || isCompleteStep ? 'text-gray-700' : 'text-gray-700'
                }`}>
                  {currentStepData.content}
                </p>

                {currentStepData.explanation && (
                  <div className="p-4 rounded-xl border-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <p className="text-blue-800 text-sm font-medium leading-relaxed">
                      💡 {currentStepData.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Section */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-600">Tutorial Progress</span>
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ 
                      width: `${progress}%`,
                      backgroundSize: '200% 100%',
                      animation: progress < 100 ? 'gradient-flow 3s ease infinite' : 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className={`p-6 border-t-2 ${
              isWelcomeStep || isCompleteStep 
                ? 'border-white/20 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm' 
                : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkip}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                      isWelcomeStep || isCompleteStep
                        ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20'
                        : 'text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Skip Tour
                  </button>
                  {!isFirstStep && (
                    <button
                      onClick={prevStep}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                        isWelcomeStep || isCompleteStep
                          ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20'
                          : 'text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Start Exploring
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 border-2 border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-200">
                <X className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Skip Tutorial?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This quick tour shows you exactly how to use Growfly's key features effectively. 
                You can restart it anytime from your settings.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  Continue Tour
                </button>
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Skip Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS Animations */}
      <style jsx global>{`
        @keyframes gradient-border {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        
        @keyframes glow-pulse {
          0% { 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
          100% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.2);
          }
        }
        
        /* Backdrop-blur fallback for older browsers */
        @supports not (backdrop-filter: blur(12px)) {
          .backdrop-fallback {
            background-color: rgba(255, 255, 255, 0.98) !important;
          }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 8s ease infinite;
        }
        
        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}

export default GrowflyTutorial