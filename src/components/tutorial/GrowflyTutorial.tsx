'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Zap, BookOpen, Image, 
  Users, Settings, Play, CheckCircle, Lightbulb
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
  tip?: string
}

const GrowflyTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [elementFound, setElementFound] = useState(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Start tutorial when prop changes
  useEffect(() => {
    if (isFirstTime) {
      setIsActive(true)
      setCurrentStep(0)
      // Lock body scroll
      document.body.style.overflow = 'hidden'
    }
  }, [isFirstTime])

  // Cleanup scroll lock when tutorial ends
  useEffect(() => {
    if (!isActive) {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isActive])

  // Enhanced tutorial steps with UK English and cleaner design
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Growfly',
      content: 'Growfly is your perfect bespoke AI assistant designed to help you and your business dramatically increase output and efficiency. Let\'s explore how Growfly can transform your workflow in just 2 minutes.',
      icon: <Play className="w-6 h-6 text-white" />
    },
    {
      id: 'dashboard',
      title: 'Dashboard - Your AI Command Centre',
      content: 'This is your central hub for AI-powered productivity. Upload any file type, engage in intelligent conversations with your AI assistant, and generate high-quality outputs instantly. Everything is designed to amplify your business capabilities.',
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      target: '[href="/dashboard"], a[href*="dashboard"], nav a[aria-current="page"], .sidebar a:first-child',
      tip: 'Start by uploading a document or image and ask Growfly to analyse it and suggest improvements or create related content.'
    },
    {
      id: 'saved-responses',
      title: 'Saved Responses - Your Knowledge Base',
      content: 'Build your personal library of AI-generated insights, templates, and solutions. Save your best outputs to create repeatable processes that scale your business efficiency and maintain consistency across projects.',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      target: '[href="/saved"], [href="/saved-responses"], a[href*="saved"], nav a:contains("Saved")',
      tip: 'Organise saved responses by project type or business function to quickly access proven templates.'
    },
    {
      id: 'gallery',
      title: 'Gallery - Visual Asset Hub',
      content: 'Your centralised visual content library where all AI-generated images are automatically organised. Download in multiple formats, share directly to platforms, and maintain brand consistency across all your visual communications.',
      icon: <Image className="w-5 h-5 text-blue-600" />,
      target: '[href="/gallery"], a[href*="gallery"], nav a:contains("Gallery")',
      tip: 'Use consistent visual themes and prompts to build a cohesive brand image library over time.'
    },
    {
      id: 'collaboration',
      title: 'Collaboration - Team Productivity Hub',
      content: 'Multiply your team\'s output by sharing AI insights, collaborating on projects in real-time, and building collective knowledge. Perfect for businesses looking to scale their operations through intelligent collaboration.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      target: '[href="/collab-zone"], [href="/collaboration"], a[href*="collab"], nav a:contains("Collab")',
      tip: 'Create dedicated workspaces for different teams or projects to maintain focus and organisation.'
    },
    {
      id: 'settings',
      title: 'Brand Settings - Personalise Your AI',
      content: 'Train Growfly to understand your unique business voice, target market, and industry specifics. The more you customise these settings, the more your AI assistant becomes an extension of your business expertise.',
      icon: <Settings className="w-5 h-5 text-blue-600" />,
      target: '[href="/brand-settings"], a[href*="brand"], nav a:contains("Brand"), nav a:contains("Settings")',
      tip: 'Invest time in detailed brand settings - this transforms generic AI into your personal business consultant.'
    },
    {
      id: 'complete',
      title: 'Ready to Amplify Your Business',
      content: 'You\'re now equipped to leverage Growfly\'s full potential. Your bespoke AI assistant is ready to help you increase output, streamline operations, and achieve better business results. Start with any task and watch your productivity soar!',
      icon: <CheckCircle className="w-6 h-6 text-white" />
    }
  ]

  // Enhanced element finding with better targeting
  const findTargetElement = useCallback((step: TutorialStep): HTMLElement | null => {
    if (!step.target || typeof document === 'undefined') return null
    
    try {
      const selectors = step.target.split(', ').map(s => s.trim()).filter(Boolean)
      
      // Prioritise exact matches first
      const prioritisedSelectors = selectors.sort((a, b) => {
        if (a.includes('href="/') && !b.includes('href="/')) return -1
        if (!a.includes('href="/') && b.includes('href="/')) return 1
        return 0
      })
      
      for (const selector of prioritisedSelectors) {
        try {
          // Handle :contains() pseudo-selector
          if (selector.includes(':contains(')) {
            const match = selector.match(/(.+):contains\(["'](.+)["']\)/)
            if (match) {
              const [, baseSelector, text] = match
              const elements = document.querySelectorAll(baseSelector)
              for (const el of Array.from(elements)) {
                if (el.textContent?.trim().includes(text.trim())) {
                  const element = el as HTMLElement
                  if (element?.offsetParent !== null && 
                      element.getBoundingClientRect().width > 0 &&
                      element.getBoundingClientRect().height > 0 &&
                      !element.hidden) {
                    return element
                  }
                }
              }
            }
          } else {
            const element = document.querySelector(selector) as HTMLElement
            if (element?.offsetParent !== null && 
                element.getBoundingClientRect().width > 0 &&
                element.getBoundingClientRect().height > 0 &&
                !element.hidden) {
              return element
            }
          }
        } catch (selectorError) {
          continue
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }, [])

  const updateTargetElement = useCallback((step: TutorialStep) => {
    if (!step.target) {
      setTargetRect(null)
      setElementFound(true)
      return
    }

    let retryCount = 0
    const maxRetries = 4

    const attemptFind = () => {
      try {
        const element = findTargetElement(step)
        
        if (element) {
          setTimeout(() => {
            const rect = element.getBoundingClientRect()
            
            if (rect && 
                rect.width > 0 && 
                rect.height > 0 && 
                rect.top >= 0 && 
                rect.left >= 0 &&
                rect.top < window.innerHeight &&
                rect.left < window.innerWidth) {
              
              setTargetRect(rect)
              setElementFound(true)
              
              // Smooth scroll to element
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              })
              return true
            }
          }, 100)
          return true
        }
        
        retryCount++
        
        if (retryCount < maxRetries) {
          retryTimeoutRef.current = setTimeout(attemptFind, 300 + (retryCount * 200))
          return false
        } else {
          setTargetRect(null)
          setElementFound(false)
          return true
        }
      } catch (error) {
        retryCount++
        if (retryCount < maxRetries) {
          retryTimeoutRef.current = setTimeout(attemptFind, 300 + (retryCount * 200))
        } else {
          setTargetRect(null)
          setElementFound(false)
        }
        return false
      }
    }

    setTimeout(attemptFind, 150)
  }, [findTargetElement])

  // Update target element when step changes
  useEffect(() => {
    if (isActive) {
      updateTargetElement(tutorialSteps[currentStep])
    }
  }, [currentStep, isActive, updateTargetElement])

  const currentStepData = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100
  const isLastStep = currentStep === tutorialSteps.length - 1
  const isFirstStep = currentStep === 0
  const isWelcomeStep = currentStepData.id === 'welcome'
  const isCompleteStep = currentStepData.id === 'complete'
  const hasTarget = currentStepData.target && targetRect && elementFound

  // Improved tooltip positioning with better viewport handling
  const getTooltipPosition = useCallback(() => {
    const tooltipWidth = 520
    const tooltipHeight = 320 // Reduced height
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 20

    // Ensure modal fits in viewport with safe margins
    const actualWidth = Math.min(tooltipWidth, viewportWidth - padding * 2)
    const actualHeight = Math.min(tooltipHeight, viewportHeight - padding * 2)

    // Welcome and complete steps - always centre
    if (isWelcomeStep || isCompleteStep || viewportWidth < 1200 || !targetRect || !hasTarget) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: `${actualWidth}px`,
        maxHeight: `${actualHeight}px`,
      }
    }

    // Desktop positioning with better viewport awareness
    const strategies = [
      // Right of target (preferred for sidebar)
      {
        top: Math.max(padding, Math.min(
          targetRect.top + (targetRect.height / 2) - (actualHeight / 2), 
          viewportHeight - actualHeight - padding
        )),
        left: targetRect.right + padding,
        valid: targetRect.right + padding + actualWidth <= viewportWidth - padding
      },
      // Left of target
      {
        top: Math.max(padding, Math.min(
          targetRect.top + (targetRect.height / 2) - (actualHeight / 2), 
          viewportHeight - actualHeight - padding
        )),
        left: targetRect.left - actualWidth - padding,
        valid: targetRect.left - actualWidth - padding >= padding
      },
      // Below target, centred
      {
        top: Math.min(targetRect.bottom + padding, viewportHeight - actualHeight - padding),
        left: Math.max(padding, Math.min(
          targetRect.left + targetRect.width/2 - actualWidth/2, 
          viewportWidth - actualWidth - padding
        )),
        valid: targetRect.bottom + padding + actualHeight <= viewportHeight - padding
      },
      // Above target, centred
      {
        top: Math.max(padding, targetRect.top - actualHeight - padding),
        left: Math.max(padding, Math.min(
          targetRect.left + targetRect.width/2 - actualWidth/2, 
          viewportWidth - actualWidth - padding
        )),
        valid: targetRect.top - actualHeight - padding >= padding
      },
      // Fallback: centre screen with safe margins
      {
        top: Math.max(padding, (viewportHeight - actualHeight) / 2),
        left: Math.max(padding, (viewportWidth - actualWidth) / 2),
        valid: true
      }
    ]

    const bestStrategy = strategies.find(s => s.valid) || strategies[strategies.length - 1]
    
    return {
      position: 'fixed' as const,
      top: `${bestStrategy.top}px`,
      left: `${bestStrategy.left}px`,
      zIndex: 1000,
      width: `${actualWidth}px`,
      maxHeight: `${actualHeight}px`,
    }
  }, [targetRect, hasTarget, isWelcomeStep, isCompleteStep])

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
    document.body.style.overflow = '' // Restore scroll
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    onComplete?.()
  }, [onComplete])

  const handleSkip = useCallback(() => {
    setShowSkipModal(true)
  }, [])

  const confirmSkip = useCallback(() => {
    setShowSkipModal(false)
    closeTutorial()
  }, [closeTutorial])

  const cancelSkip = useCallback(() => {
    setShowSkipModal(false)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return
      
      switch (e.key) {
        case 'Escape':
          handleSkip()
          break
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault()
          nextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevStep()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, nextStep, prevStep, handleSkip])

  // Cleanup
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      document.body.style.overflow = ''
    }
  }, [])

  if (!isActive) return null

  return (
    <>
      {/* Enhanced Overlay System */}
      <div className="fixed inset-0 z-50 transition-all duration-500">
        
        {/* Welcome/Complete Step: Full Opaque Blue Background */}
        {(isWelcomeStep || isCompleteStep) && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 transition-all duration-700" />
        )}
        
        {/* Other Steps: Spotlight effect for highlighted elements */}
        {!isWelcomeStep && !isCompleteStep && hasTarget && targetRect && (
          <>
            {/* Dark overlay with precise spotlight cutout */}
            <div 
              className="absolute inset-0 transition-all duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse ${Math.round(targetRect.width + 60)}px ${Math.round(targetRect.height + 60)}px at ${Math.round(targetRect.left + targetRect.width/2)}px ${Math.round(targetRect.top + targetRect.height/2)}px, transparent 0%, transparent 15%, rgba(0, 0, 0, 0.75) 65%)`
              }}
            />
            
            {/* Animated blue border around target */}
            <div 
              className="absolute transition-all duration-700 pointer-events-none"
              style={{
                top: Math.round(targetRect.top - 6),
                left: Math.round(targetRect.left - 6),
                width: Math.round(targetRect.width + 12),
                height: Math.round(targetRect.height + 12),
                border: '3px solid #3B82F6',
                borderRadius: '16px',
                boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)',
                animation: 'glow-pulse 2s ease-in-out infinite alternate'
              }}
            />
            
            {/* Inner highlight */}
            <div 
              className="absolute transition-all duration-700 pointer-events-none"
              style={{
                top: Math.round(targetRect.top - 2),
                left: Math.round(targetRect.left - 2),
                width: Math.round(targetRect.width + 4),
                height: Math.round(targetRect.height + 4),
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            />
          </>
        )}

        {/* Other Steps: Standard dark overlay when no target */}
        {!isWelcomeStep && !isCompleteStep && (!hasTarget || !targetRect) && (
          <div className="absolute inset-0 bg-black/60 transition-all duration-700" />
        )}

        {/* Tutorial Modal */}
        <div 
          style={getTooltipPosition()}
          className="transition-all duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
        >
          <div className={`rounded-3xl shadow-2xl border flex flex-col overflow-hidden ${
            isWelcomeStep || isCompleteStep 
              ? 'bg-white/95 backdrop-blur-sm border-white/20' 
              : 'bg-white border-gray-100'
          }`} style={{ height: 'fit-content', maxHeight: '100%' }}>
            
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${
              isWelcomeStep || isCompleteStep 
                ? 'border-white/20 bg-white/50' 
                : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  isWelcomeStep || isCompleteStep
                    ? 'bg-white/20 border-white/30 backdrop-blur-sm'
                    : 'bg-blue-50 border-blue-100'
                }`}>
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 id="tutorial-title" className={`text-xl font-semibold ${
                    isWelcomeStep || isCompleteStep ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentStepData.title}
                  </h2>
                  <div className={`flex items-center gap-2 text-sm ${
                    isWelcomeStep || isCompleteStep ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                    <span>•</span>
                    <span>Growfly Tutorial</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isWelcomeStep || isCompleteStep
                    ? 'hover:bg-white/20 text-white/70 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Skip tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              <div className="mb-5">
                <p className={`leading-relaxed mb-4 ${
                  isWelcomeStep || isCompleteStep ? 'text-white/90' : 'text-gray-700'
                }`}>
                  {currentStepData.content}
                </p>

                {/* Pro tip */}
                {currentStepData.tip && (
                  <div className={`rounded-xl p-4 ${
                    isWelcomeStep || isCompleteStep
                      ? 'bg-white/20 border border-white/30 backdrop-blur-sm'
                      : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isWelcomeStep || isCompleteStep
                          ? 'bg-white/20'
                          : 'bg-amber-100'
                      }`}>
                        <Lightbulb className={`w-4 h-4 ${
                          isWelcomeStep || isCompleteStep ? 'text-white' : 'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className={`font-medium text-sm mb-1 ${
                          isWelcomeStep || isCompleteStep ? 'text-white' : 'text-amber-800'
                        }`}>
                          Pro Tip
                        </p>
                        <p className={`text-sm leading-relaxed ${
                          isWelcomeStep || isCompleteStep ? 'text-white/90' : 'text-amber-700'
                        }`}>
                          {currentStepData.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-1">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-medium ${
                    isWelcomeStep || isCompleteStep ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    Progress
                  </span>
                  <span className={`text-sm font-semibold ${
                    isWelcomeStep || isCompleteStep ? 'text-white' : 'text-blue-600'
                  }`}>
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isWelcomeStep || isCompleteStep ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${
                      isWelcomeStep || isCompleteStep 
                        ? 'bg-gradient-to-r from-white to-white/80' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className={`border-t p-5 flex-shrink-0 ${
              isWelcomeStep || isCompleteStep 
                ? 'border-white/20 bg-white/30 backdrop-blur-sm' 
                : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkip}
                    className={`text-sm font-medium transition-colors px-4 py-2.5 rounded-xl border ${
                      isWelcomeStep || isCompleteStep
                        ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/30'
                        : 'text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    Skip tour
                  </button>
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 px-4 py-2.5 rounded-xl border ${
                        isWelcomeStep || isCompleteStep
                          ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/30'
                          : 'text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isWelcomeStep || isCompleteStep
                      ? 'bg-white text-blue-600 hover:bg-white/90'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <X className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Skip Tutorial?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              This tutorial shows you features that can significantly boost your business output. You can restart it later from Settings.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelSkip}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-xl font-medium transition-all duration-200"
              >
                Continue Tour
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for glow animation */}
      <style jsx global>{`
        @keyframes glow-pulse {
          0% { 
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.4);
          }
          100% { 
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </>
  )
}

export default GrowflyTutorial