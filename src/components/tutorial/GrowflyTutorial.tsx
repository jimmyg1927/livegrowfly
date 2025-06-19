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

  // Enhanced element finding with precise targeting
  const findTargetElement = useCallback((step: TutorialStep): HTMLElement | null => {
    if (!step.target || typeof document === 'undefined') return null
    
    try {
      const selectors = step.target.split(', ').map(s => s.trim()).filter(Boolean)
      
      // Prioritize selectors - exact href matches first, then partial matches
      const prioritizedSelectors = selectors.sort((a, b) => {
        if (a.includes('href="/') && !b.includes('href="/')) return -1
        if (!a.includes('href="/') && b.includes('href="/')) return 1
        if (a.includes('[href*=') && !b.includes('[href*=')) return -1
        if (!a.includes('[href*=') && b.includes('[href*=')) return 1
        return 0
      })
      
      for (const selector of prioritizedSelectors) {
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
                  // More precise visibility check
                  if (element?.offsetParent !== null && 
                      element.getBoundingClientRect().width > 0 &&
                      element.getBoundingClientRect().height > 0 &&
                      !element.hidden) {
                    console.log(`✅ Found element with :contains: ${selector}`, element)
                    return element
                  }
                }
              }
            }
          } else {
            const element = document.querySelector(selector) as HTMLElement
            // More precise visibility and positioning check
            if (element?.offsetParent !== null && 
                element.getBoundingClientRect().width > 0 &&
                element.getBoundingClientRect().height > 0 &&
                !element.hidden) {
              console.log(`✅ Found element with selector: ${selector}`, element)
              return element
            }
          }
        } catch (selectorError) {
          console.log(`❌ Selector error: ${selector}`, selectorError)
          continue
        }
      }
      
      console.log(`❌ No valid elements found for: ${step.target}`)
      return null
    } catch (error) {
      console.log('❌ Error in findTargetElement:', error)
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
          // Wait a small amount for any animations to settle
          setTimeout(() => {
            const rect = element.getBoundingClientRect()
            
            // More thorough validation of the rect
            if (rect && 
                rect.width > 0 && 
                rect.height > 0 && 
                rect.top >= 0 && 
                rect.left >= 0 &&
                rect.top < window.innerHeight &&
                rect.left < window.innerWidth) {
              
              console.log(`✅ Setting target rect:`, { 
                width: rect.width, 
                height: rect.height, 
                top: rect.top, 
                left: rect.left 
              })
              
              setTargetRect(rect)
              setElementFound(true)
              
              // Smooth scroll to element with better positioning
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              })
              return true
            } else {
              console.log(`❌ Invalid rect:`, rect)
            }
          }, 100)
          return true
        }
        
        retryCount++
        console.log(`🔍 Element not found, retry ${retryCount}/${maxRetries}`)
        
        if (retryCount < maxRetries) {
          retryTimeoutRef.current = setTimeout(attemptFind, 300 + (retryCount * 200))
          return false
        } else {
          console.log('❌ Max retries reached, showing tutorial without highlighting')
          setTargetRect(null)
          setElementFound(false)
          return true
        }
      } catch (error) {
        console.log('❌ Error in attemptFind:', error)
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

    // Start finding with a small delay to ensure DOM is ready
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
  const hasTarget = currentStepData.target && targetRect && elementFound

  // Get tooltip position - improved to stay on screen
  const getTooltipPosition = useCallback(() => {
    const tooltipWidth = 520  // Slightly wider
    const tooltipHeight = 360 // Much shorter
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 20

    // Always ensure modal fits in viewport
    const actualWidth = Math.min(tooltipWidth, viewportWidth - padding * 2)
    const actualHeight = Math.min(tooltipHeight, viewportHeight - padding * 2)

    // Mobile or small screen - center
    if (viewportWidth < 1200 || !targetRect || !hasTarget) {
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

    // Desktop positioning strategies
    const strategies = [
      // Right of target (preferred for sidebar)
      {
        top: Math.max(padding, Math.min(targetRect.top, viewportHeight - actualHeight - padding)),
        left: targetRect.right + padding,
        valid: targetRect.right + padding + actualWidth <= viewportWidth - padding
      },
      // Left of target
      {
        top: Math.max(padding, Math.min(targetRect.top, viewportHeight - actualHeight - padding)),
        left: targetRect.left - actualWidth - padding,
        valid: targetRect.left - actualWidth - padding >= padding
      },
      // Below target, centered
      {
        top: Math.min(targetRect.bottom + padding, viewportHeight - actualHeight - padding),
        left: Math.max(padding, Math.min(
          targetRect.left + targetRect.width/2 - actualWidth/2, 
          viewportWidth - actualWidth - padding
        )),
        valid: targetRect.bottom + padding + actualHeight <= viewportHeight - padding
      },
      // Above target, centered
      {
        top: Math.max(padding, targetRect.top - actualHeight - padding),
        left: Math.max(padding, Math.min(
          targetRect.left + targetRect.width/2 - actualWidth/2, 
          viewportWidth - actualWidth - padding
        )),
        valid: targetRect.top - actualHeight - padding >= padding
      },
      // Fallback: center screen
      {
        top: Math.max(padding, (viewportHeight - actualHeight) / 2),
        left: Math.max(padding, (viewportWidth - actualWidth) / 2),
        valid: true
      }
    ]

    // Find first valid strategy
    const bestStrategy = strategies.find(s => s.valid) || strategies[strategies.length - 1]
    
    return {
      position: 'fixed' as const,
      top: `${bestStrategy.top}px`,
      left: `${bestStrategy.left}px`,
      zIndex: 1000,
      width: `${actualWidth}px`,
      maxHeight: `${actualHeight}px`,
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
            {/* Dark overlay with precise spotlight cutout */}
            <div 
              className="absolute inset-0 transition-all duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse ${Math.round(targetRect.width + 60)}px ${Math.round(targetRect.height + 60)}px at ${Math.round(targetRect.left + targetRect.width/2)}px ${Math.round(targetRect.top + targetRect.height/2)}px, transparent 0%, transparent 15%, rgba(0, 0, 0, 0.75) 65%)`
              }}
            />
            
            {/* Precise animated blue border around target */}
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
            
            {/* Inner highlight for better visibility */}
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

        {/* Tutorial Modal */}
        <div 
          style={getTooltipPosition()}
          className="transition-all duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col" style={{ height: 'fit-content' }}>
            {/* Compact Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 id="tutorial-title" className="text-lg font-semibold text-gray-900">
                    {currentStepData.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                    <span>•</span>
                    <span>Growfly Tutorial</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
                aria-label="Skip tutorial"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Compact Content */}
            <div className="flex-1 p-4">
              {/* Main content */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed text-sm mb-3">
                  {currentStepData.content}
                </p>

                {/* Compact feature highlights */}
                {currentStepData.features && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {currentStepData.features.slice(0, 4).map((feature, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                        >
                          <Star className="w-2.5 h-2.5" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compact pro tip */}
                {currentStepData.tip && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-800 text-xs mb-1">Pro Tip</p>
                        <p className="text-amber-700 text-xs leading-relaxed">
                          {currentStepData.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">Progress</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Compact Navigation Footer */}
            <div className="border-t border-gray-100 p-4 flex-shrink-0 bg-gray-50 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors bg-white hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200"
                  >
                    Skip tour
                  </button>
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium transition-all duration-200 bg-white hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
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

      {/* Compact Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <X className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Skip Tutorial?
              </h3>
            </div>
            <p className="text-gray-600 mb-5 text-sm">
              This tutorial shows you features that can significantly boost your business output. You can restart it later from Settings.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={cancelSkip}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2.5 px-3 rounded-xl font-medium transition-all duration-200 text-sm"
              >
                Continue Tour
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-xl font-medium transition-all duration-200 text-sm"
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