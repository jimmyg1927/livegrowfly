'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Zap, BookOpen, Image, 
  Users, Settings, Play, CheckCircle, Lightbulb, Star,
  Upload, Download, Share2, Brain
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
  features?: string[]
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
    }
  }, [isFirstTime])

  // Enhanced tutorial steps with better copy
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Growfly',
      content: 'Growfly is your perfect bespoke AI assistant designed to help you and your business dramatically increase output and efficiency. Let\'s explore how Growfly can transform your workflow in just 2 minutes.',
      icon: <Play className="w-5 h-5 text-blue-600" />,
      features: ['Bespoke AI Assistant', 'Increased Business Output', 'Workflow Transformation', 'Efficiency Optimization']
    },
    {
      id: 'dashboard',
      title: 'Dashboard - Your AI Command Center',
      content: 'This is your central hub for AI-powered productivity. Upload any file type, engage in intelligent conversations with your AI assistant, and generate high-quality outputs instantly. Everything is designed to amplify your business capabilities.',
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      target: '[href="/dashboard"], a[href*="dashboard"], nav a:contains("Dashboard")',
      features: ['Multi-format uploads', 'Intelligent conversations', 'Instant outputs', 'Business amplification'],
      tip: 'Start by uploading a document or image and ask Growfly to analyze it and suggest improvements or create related content.'
    },
    {
      id: 'saved-responses',
      title: 'Saved Responses - Your Knowledge Base',
      content: 'Build your personal library of AI-generated insights, templates, and solutions. Save your best outputs to create repeatable processes that scale your business efficiency and maintain consistency across projects.',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      target: '[href="/saved"], a[href*="saved"], nav a:contains("Saved")',
      features: ['Knowledge library', 'Template creation', 'Process scaling', 'Consistency maintenance'],
      tip: 'Organize saved responses by project type or business function to quickly access proven templates.'
    },
    {
      id: 'gallery',
      title: 'Gallery - Visual Asset Hub',
      content: 'Your centralized visual content library where all AI-generated images are automatically organized. Download in multiple formats, share directly to platforms, and maintain brand consistency across all your visual communications.',
      icon: <Image className="w-5 h-5 text-blue-600" />,
      target: '[href="/gallery"], a[href*="gallery"], nav a:contains("Gallery")',
      features: ['Auto-organized visuals', 'Multiple formats', 'Direct sharing', 'Brand consistency'],
      tip: 'Use consistent visual themes and prompts to build a cohesive brand image library over time.'
    },
    {
      id: 'collaboration',
      title: 'Collaboration - Team Productivity Hub',
      content: 'Multiply your team\'s output by sharing AI insights, collaborating on projects in real-time, and building collective knowledge. Perfect for businesses looking to scale their operations through intelligent collaboration.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      target: '[href="/collab-zone"], a[href*="collab"], nav a:contains("Collab")',
      features: ['Team multiplication', 'Real-time collaboration', 'Collective knowledge', 'Operational scaling'],
      tip: 'Create dedicated workspaces for different teams or projects to maintain focus and organization.'
    },
    {
      id: 'settings',
      title: 'Brand Settings - Personalize Your AI',
      content: 'Train Growfly to understand your unique business voice, target market, and industry specifics. The more you customize these settings, the more your AI assistant becomes an extension of your business expertise.',
      icon: <Settings className="w-5 h-5 text-blue-600" />,
      target: '[href="/brand-settings"], a[href*="brand"], nav a:contains("Brand"), nav a:contains("Settings")',
      features: ['Business voice training', 'Market targeting', 'Industry expertise', 'AI personalization'],
      tip: 'Invest time in detailed brand settings - this transforms generic AI into your personal business consultant.'
    },
    {
      id: 'complete',
      title: 'Ready to Amplify Your Business',
      content: 'You\'re now equipped to leverage Growfly\'s full potential. Your bespoke AI assistant is ready to help you increase output, streamline operations, and achieve better business results. Start with any task and watch your productivity soar!',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      features: ['Business amplification', 'Increased output', 'Streamlined operations', 'Better results']
    }
  ]

  // Enhanced element finding with better targeting
  const findTargetElement = useCallback((step: TutorialStep): HTMLElement | null => {
    if (!step.target || typeof document === 'undefined') return null
    
    try {
      const selectors = step.target.split(', ').map(s => s.trim()).filter(Boolean)
      
      for (const selector of selectors) {
        try {
          // Handle :contains() pseudo-selector
          if (selector.includes(':contains(')) {
            const match = selector.match(/(.+):contains\(["'](.+)["']\)/)
            if (match) {
              const [, baseSelector, text] = match
              const elements = document.querySelectorAll(baseSelector)
              for (const el of Array.from(elements)) {
                if (el.textContent?.includes(text)) {
                  const element = el as HTMLElement
                  if (element?.offsetParent !== null && 
                      element.getBoundingClientRect().width > 0) {
                    return element
                  }
                }
              }
            }
          } else {
            const element = document.querySelector(selector) as HTMLElement
            if (element?.offsetParent !== null && 
                element.getBoundingClientRect().width > 0) {
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
    const maxRetries = 3

    const attemptFind = () => {
      const element = findTargetElement(step)
      
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect)
          setElementFound(true)
          
          // Smooth scroll to element
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          })
          return true
        }
      }
      
      retryCount++
      if (retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(attemptFind, 500)
        return false
      } else {
        setTargetRect(null)
        setElementFound(false)
        return true
      }
    }

    setTimeout(attemptFind, 200)
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
  const hasTarget = currentStepData.target && targetRect && elementFound

  // Get tooltip position relative to highlighted element
  const getTooltipPosition = useCallback(() => {
    const tooltipWidth = 480
    const tooltipHeight = 420
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 24

    // Mobile or no target - center on screen
    if (viewportWidth < 1024 || !targetRect || !hasTarget) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: `${Math.min(tooltipWidth, viewportWidth - padding * 2)}px`,
      }
    }

    // Desktop positioning - prefer right side for sidebar elements
    const strategies = [
      // Right of target
      {
        top: Math.min(targetRect.top, viewportHeight - tooltipHeight - padding),
        left: targetRect.right + padding,
        score: targetRect.right + padding + tooltipWidth <= viewportWidth - padding ? 10 : 0
      },
      // Left of target
      {
        top: Math.min(targetRect.top, viewportHeight - tooltipHeight - padding),
        left: targetRect.left - tooltipWidth - padding,
        score: targetRect.left - tooltipWidth - padding >= padding ? 8 : 0
      },
      // Below target
      {
        top: Math.min(targetRect.bottom + padding, viewportHeight - tooltipHeight - padding),
        left: Math.max(padding, Math.min(targetRect.left, viewportWidth - tooltipWidth - padding)),
        score: targetRect.bottom + padding + tooltipHeight <= viewportHeight - padding ? 6 : 0
      },
      // Center fallback
      {
        top: (viewportHeight - tooltipHeight) / 2,
        left: (viewportWidth - tooltipWidth) / 2,
        score: 1
      }
    ]

    const bestStrategy = strategies
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)[0]
    
    return {
      position: 'fixed' as const,
      top: `${Math.max(padding, bestStrategy.top)}px`,
      left: `${Math.max(padding, bestStrategy.left)}px`,
      zIndex: 1000,
      width: `${Math.min(tooltipWidth, viewportWidth - padding * 2)}px`,
    }
  }, [targetRect, hasTarget])

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
    }
  }, [])

  if (!isActive) return null

  return (
    <>
      {/* Enhanced Overlay with Spotlight Effect */}
      <div className="fixed inset-0 z-50 transition-all duration-500">
        
        {/* Spotlight effect for highlighted elements */}
        {hasTarget && targetRect && (
          <>
            {/* Dark overlay with spotlight cutout */}
            <div 
              className="absolute inset-0 transition-all duration-700"
              style={{
                background: `radial-gradient(ellipse ${targetRect.width + 80}px ${targetRect.height + 80}px at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent 0%, transparent 20%, rgba(0, 0, 0, 0.7) 70%)`
              }}
            />
            
            {/* Animated blue border around target */}
            <div 
              className="absolute rounded-2xl transition-all duration-700"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                border: '3px solid #3B82F6',
                boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)',
                animation: 'glow-pulse 2s ease-in-out infinite alternate'
              }}
            />
          </>
        )}

        {/* Tutorial Modal */}
        <div 
          style={getTooltipPosition()}
          className="transition-all duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 id="tutorial-title" className="text-xl font-semibold text-gray-900 mb-1">
                    {currentStepData.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                    <span>•</span>
                    <span>Growfly Tutorial</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="w-10 h-10 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Skip tutorial"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Main content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-base mb-4">
                  {currentStepData.content}
                </p>

                {/* Feature highlights */}
                {currentStepData.features && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {currentStepData.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                        >
                          <Star className="w-3 h-3" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pro tip */}
                {currentStepData.tip && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-800 text-sm mb-1">Pro Tip</p>
                        <p className="text-amber-700 text-sm leading-relaxed">
                          {currentStepData.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">Tutorial Progress</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-2xl"
                  >
                    Skip tour
                  </button>
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-all duration-200 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-2xl hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
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

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                <X className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Skip Tutorial?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              This tutorial shows you features that can significantly boost your business output. You can always restart it later from Settings.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelSkip}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-2xl font-medium transition-all duration-200 hover:scale-105"
              >
                Continue Tour
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200 hover:scale-105"
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