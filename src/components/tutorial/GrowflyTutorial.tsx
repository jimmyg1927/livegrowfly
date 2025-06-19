'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

  // Start tutorial when prop changes
  useEffect(() => {
    if (isFirstTime) {
      setIsActive(true)
      setCurrentStep(0)
    }
  }, [isFirstTime])

  // Comprehensive but focused tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Growfly',
      content: 'Growfly is your AI-powered content creation workspace. We\'ll show you the key features that will streamline your content workflow and boost your productivity.',
      icon: <Play className="w-5 h-5 text-blue-600" />,
      features: ['AI Content Generation', 'Team Collaboration', 'Asset Management', 'Brand Consistency']
    },
    {
      id: 'dashboard',
      title: 'Dashboard - Your Command Center',
      content: 'This is where the magic happens. Upload any file type (images, PDFs, documents), have conversations with advanced AI models, and generate professional content instantly. Everything you create can be downloaded in multiple formats.',
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      target: '[href="/dashboard"]',
      features: ['Multi-format uploads', 'AI conversations', 'Instant downloads', 'Content generation'],
      tip: 'Try uploading an image and asking AI to create social media posts from it, or paste a URL for instant content analysis.'
    },
    {
      id: 'saved-responses',
      title: 'Saved Responses - Your Content Library',
      content: 'Build your personal content vault by saving your best AI responses. Create templates for different content types, organize by projects, and never lose great ideas again. Perfect for building repeatable workflows.',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      target: '[href="/saved"]',
      features: ['Template creation', 'Project organization', 'Content reuse', 'Search & filter'],
      tip: 'Save responses strategically to build templates for emails, social posts, and marketing copy.'
    },
    {
      id: 'gallery',
      title: 'Gallery - Visual Asset Manager',
      content: 'Every AI-generated image is automatically saved here. Download in multiple formats (PNG, JPG, SVG), share directly to social platforms, and organize by campaigns to maintain brand consistency.',
      icon: <Image className="w-5 h-5 text-blue-600" />,
      target: '[href="/gallery"]',
      features: ['Auto-save images', 'Multiple formats', 'Social sharing', 'Campaign organization'],
      tip: 'Use the gallery to maintain visual brand consistency across all your marketing materials.'
    },
    {
      id: 'collaboration',
      title: 'Collaboration - Teamwork Made Easy',
      content: 'Share AI responses with team members, collaborate on documents in real-time, and work together on content projects. Perfect for agencies, marketing teams, and any business scaling content creation.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      target: '[href="/collab-zone"]',
      features: ['Real-time sharing', 'Team workspaces', 'Collaborative editing', 'Project management'],
      tip: 'Set up team workspaces for different clients or projects to keep everything organized.'
    },
    {
      id: 'settings',
      title: 'Brand Settings - Personalize Your AI',
      content: 'Train the AI to understand your brand voice, target audience, and industry specifics. The more information you provide, the more personalized and on-brand your AI responses become.',
      icon: <Settings className="w-5 h-5 text-blue-600" />,
      target: '[href="/brand-settings"]',
      features: ['Brand voice training', 'Audience targeting', 'Industry customization', 'Tone preferences'],
      tip: 'Spend a few minutes setting up your brand profile - it dramatically improves response quality.'
    },
    {
      id: 'complete',
      title: 'Ready to Create Amazing Content',
      content: 'You now have everything you need to create professional, on-brand content with AI assistance. Start with a simple prompt and explore the features as you go. Welcome to the future of content creation!',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      features: ['Content mastery', 'Time savings', 'Professional results', 'Competitive advantage']
    }
  ]

  const currentStepData = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100
  const isLastStep = currentStep === tutorialSteps.length - 1

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

  if (!isActive) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        {/* Tutorial Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
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
              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Skip tour
                </button>
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>
              
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
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

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Skip Tutorial?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              This tutorial shows you features that can save time and improve your workflow. You can always restart it later from Settings.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelSkip}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Continue Tour
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GrowflyTutorial