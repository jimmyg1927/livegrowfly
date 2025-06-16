'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, 
  Image, BookOpen, X, ChevronRight, ChevronLeft, Star, Rocket, 
  Target, Brain, Palette, MessageCircle, Gift, Crown, Wand2
} from 'lucide-react'

interface GrowflyTutorialProps {
  isFirstTime?: boolean
  onComplete?: () => void
}

interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  icon: React.ReactNode
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
  actionText?: string
  proTip?: string
  challenge?: string
  celebration?: boolean
}

const GrowflyTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [stepCompleted, setStepCompleted] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Listen for custom event from settings page
  useEffect(() => {
    const handleStartTour = () => {
      setTimeout(() => startTutorial(), 500)
      playSound('start')
    }

    window.addEventListener('startGrowflyTour', handleStartTour)
    
    return () => {
      window.removeEventListener('startGrowflyTour', handleStartTour)
    }
  }, [])

  useEffect(() => {
    if (isFirstTime) {
      setTimeout(() => {
        startTutorial()
        playSound('welcome')
      }, 1000)
    }
  }, [isFirstTime])

  // Sound effects using Web Audio API
  const playSound = useCallback((type: 'start' | 'step' | 'complete' | 'welcome' | 'celebration') => {
    if (typeof window === 'undefined') return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different frequencies for different actions
      const frequencies = {
        start: [440, 550, 660],
        step: [523.25],
        complete: [523.25, 659.25, 783.99],
        welcome: [440, 523.25, 659.25],
        celebration: [523.25, 659.25, 783.99, 1046.50]
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
      // Gracefully handle audio errors
      console.log('Audio not available')
    }
  }, [])

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      target: 'body',
      title: 'Welcome to Growfly! 🚀',
      content: 'Get ready for an incredible journey! Growfly is your AI-powered business growth companion that adapts to YOUR unique needs. With cutting-edge features added daily, you\'re about to unlock the future of business success!',
      icon: <div className="relative"><Sparkles className="w-8 h-8 text-purple-500 animate-pulse" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div></div>,
      placement: 'center',
      actionText: 'Start Your Journey',
      proTip: 'This tour takes just 2 minutes but could transform your business forever!',
      celebration: true
    },
    {
      id: 'dashboard',
      target: '[data-tour="dashboard"]',
      title: 'Your AI Command Center 🎯',
      content: 'This is mission control for your business growth! Here, you can have natural conversations with AI that knows YOUR brand, upload any file type for instant analysis, and generate content that sounds authentically you.',
      icon: <div className="relative"><Zap className="w-7 h-7 text-yellow-500" /><Target className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-spin" /></div>,
      placement: 'bottom',
      actionText: 'Try asking: "Create a social media campaign for my new product launch"',
      proTip: 'Pro tip: The more specific you are, the more amazing your results will be!',
      challenge: 'Challenge: Upload a document and ask Growfly to summarize it in your brand voice'
    },
    {
      id: 'saved-responses',
      target: '[data-tour="saved-responses"]',
      title: 'Your Digital Treasure Vault 💎',
      content: 'Every brilliant response becomes a reusable asset! Save your best AI-generated content here and build an ever-growing library of winning templates, copy, and ideas that you can customize and reuse infinitely.',
      icon: <div className="relative"><Heart className="w-7 h-7 text-red-500 animate-pulse" /><Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" /></div>,
      placement: 'right',
      actionText: 'Build your content empire, one response at a time',
      proTip: 'Smart entrepreneurs save everything - you never know when you\'ll need that perfect headline again!',
      challenge: 'Goal: Create your first template library this week'
    },
    {
      id: 'collab-zone',
      target: '[data-tour="collab-zone"]',
      title: 'Team Collaboration Magic 🤝',
      content: 'Transform solo work into team brilliance! Share AI responses instantly with your team, collaborate in real-time, provide feedback, and download polished final versions. Turn individual insights into collective genius.',
      icon: <div className="relative"><Users className="w-7 h-7 text-blue-500" /><Wand2 className="w-3 h-3 text-blue-300 absolute -top-1 -right-1 animate-bounce" /></div>,
      placement: 'right',
      actionText: 'Perfect for agencies, marketing teams, and content creators',
      proTip: 'Teams using collaborative AI are 3x more productive than solo workers!',
      challenge: 'Next step: Invite your first team member and share a response'
    },
    {
      id: 'gallery',
      target: '[data-tour="gallery"]',
      title: 'Your Creative Masterpiece Gallery 🎨',
      content: 'Every visual you create becomes part of your growing creative portfolio! Browse stunning AI-generated artwork, organize by campaigns, and watch your visual brand library expand with every creation.',
      icon: <div className="relative"><Image className="w-7 h-7 text-pink-500" /><Palette className="w-3 h-3 text-pink-300 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'right',
      actionText: 'From social media graphics to presentation visuals - all in one place',
      proTip: 'Visual content gets 94% more engagement than text alone!',
      challenge: 'Try this: Generate 5 different styles of the same concept'
    },
    {
      id: 'education-hub',
      target: '[data-tour="education-hub"]',
      title: 'AI Mastery Academy 🎓',
      content: 'Level up from AI beginner to business growth expert! Access cutting-edge strategies, proven frameworks, and insider techniques that top entrepreneurs use to 10x their results with AI.',
      icon: <div className="relative"><BookOpen className="w-7 h-7 text-indigo-500" /><Brain className="w-3 h-3 text-indigo-300 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'right',
      actionText: 'From prompt engineering to growth hacking - master it all',
      proTip: 'Companies using AI strategically grow 5x faster than competitors!',
      challenge: 'This week: Complete one advanced tutorial and implement the strategy'
    },
    {
      id: 'wishlist',
      target: '[data-tour="wishlist"]',
      title: 'Shape Growfly\'s Future 💡',
      content: 'Your ideas drive our innovation! This isn\'t just a suggestion box - it\'s where game-changing features are born. Our development team prioritizes the most-loved ideas from power users like you.',
      icon: <div className="relative"><Lightbulb className="w-7 h-7 text-yellow-500 animate-pulse" /><Star className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-spin" /></div>,
      placement: 'right',
      actionText: 'Your breakthrough idea could become reality within weeks',
      proTip: 'Users who actively suggest features get early access to new releases!',
      challenge: 'Mission: Submit your first feature idea and vote on others'
    },
    {
      id: 'trusted-partners',
      target: '[data-tour="trusted-partners"]',
      title: 'Human + AI Powerhouse 🌉',
      content: 'Coming soon: The perfect fusion of AI efficiency and human expertise! Connect with verified professionals who can take your AI-generated work to the final mile. Think AI + expert = unstoppable results.',
      icon: <div className="relative"><Handshake className="w-7 h-7 text-green-500" /><Rocket className="w-3 h-3 text-green-300 absolute -top-1 -right-1 animate-bounce" /></div>,
      placement: 'right',
      actionText: 'The future of work: AI creativity + human polish',
      proTip: 'Early access list members get 50% off professional services when we launch!',
      challenge: 'Be ready: Join the waitlist for exclusive early access'
    },
    {
      id: 'brand-settings',
      target: '[data-tour="brand-settings"]',
      title: 'Your Brand DNA Lab 🧬',
      content: 'This is where the magic begins! Fine-tune how Growfly understands your unique voice, style, and business personality. The more it knows about you, the more it becomes your perfect AI business partner.',
      icon: <div className="relative"><Settings className="w-7 h-7 text-gray-600" /><MessageCircle className="w-3 h-3 text-gray-400 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'right',
      actionText: 'Make every AI response sound authentically YOU',
      proTip: 'Brands with consistent voice across all content see 23% more revenue!',
      challenge: 'Action item: Spend 5 minutes perfecting your brand voice settings'
    },
    {
      id: 'xp-system',
      target: '[data-tour="xp-system"]',
      title: 'Level Up & Get Rewarded 🏆',
      content: 'Every interaction makes you stronger! Earn XP, unlock achievements, and climb the leaderboards. Top performers get exclusive rewards: gift cards, VIP event access, networking opportunities, and surprise bonuses!',
      icon: <div className="relative"><Trophy className="w-7 h-7 text-amber-500 animate-bounce" /><Gift className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" /></div>,
      placement: 'left',
      actionText: 'Gaming meets business growth - achieve while you succeed',
      proTip: 'Power users in the top 10% get monthly surprise rewards!',
      challenge: 'Your first goal: Reach level 5 this week by engaging daily'
    },
    {
      id: 'finale',
      target: 'body',
      title: 'You\'re Ready to Dominate! 🚀',
      content: 'Congratulations, growth hacker! You\'ve unlocked the full power of Growfly. You\'re now equipped with tools that 99% of businesses don\'t even know exist. Time to leave your competition in the dust!',
      icon: <div className="relative"><Rocket className="w-8 h-8 text-emerald-500 animate-bounce" /><Crown className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 animate-pulse" /></div>,
      placement: 'center',
      actionText: 'Start your business transformation NOW',
      proTip: 'Remember: You can replay this tour anytime from Settings → Tutorial',
      challenge: 'Ultimate challenge: Generate your first piece of content right now!',
      celebration: true
    }
  ]

  const startTutorial = () => {
    setCurrentStep(0)
    setIsActive(true)
    setStepCompleted(false)
    setUserInteracted(false)
    updateTargetPosition(tutorialSteps[0])
    playSound('start')
  }

  const updateTargetPosition = (step: TutorialStep) => {
    setIsAnimating(true)
    
    if (step.target === 'body') {
      setTargetRect(null)
      setIsAnimating(false)
      return
    }

    setTimeout(() => {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Add pulse animation to target
        element.style.animation = 'tutorial-pulse 2s infinite'
        setTimeout(() => {
          if (element.style) element.style.animation = ''
        }, 4000)
      } else {
        setTargetRect(null)
      }
      setIsAnimating(false)
    }, 300)
  }

  const nextStep = () => {
    playSound('step')
    setStepCompleted(true)
    
    if (tutorialSteps[currentStep].celebration) {
      setShowConfetti(true)
      playSound('celebration')
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    setTimeout(() => {
      if (currentStep < tutorialSteps.length - 1) {
        const nextStepIndex = currentStep + 1
        setCurrentStep(nextStepIndex)
        setStepCompleted(false)
        setUserInteracted(false)
        updateTargetPosition(tutorialSteps[nextStepIndex])
      } else {
        closeTutorial()
      }
    }, 500)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1
      setCurrentStep(prevStepIndex)
      setStepCompleted(false)
      setUserInteracted(false)
      updateTargetPosition(tutorialSteps[prevStepIndex])
    }
  }

  const closeTutorial = () => {
    setShowConfetti(true)
    playSound('complete')
    
    setTimeout(() => {
      setIsActive(false)
      setTargetRect(null)
      setShowConfetti(false)
      localStorage.setItem('growfly-tutorial-completed', 'true')
      if (onComplete) onComplete()
    }, 2000)
  }

  const skipTutorial = () => {
    if (window.confirm('Are you sure you want to skip this amazing tour? You\'ll miss out on some incredible features!')) {
      closeTutorial()
    }
  }

  if (!isActive) return null

  const currentStepData = tutorialSteps[currentStep]
  const isCenter = currentStepData.placement === 'center'
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  const getTooltipPosition = () => {
    if (isCenter || !targetRect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = 20
    let top = 0
    let left = 0

    switch (currentStepData.placement) {
      case 'bottom':
        top = targetRect.bottom + padding
        left = targetRect.left + targetRect.width / 2
        break
      case 'top':
        top = targetRect.top - padding - 300
        left = targetRect.left + targetRect.width / 2
        break
      case 'right':
        top = targetRect.top + targetRect.height / 2
        left = targetRect.right + padding
        break
      case 'left':
        top = targetRect.top + targetRect.height / 2
        left = targetRect.left - padding - 400
        break
      default:
        top = targetRect.bottom + padding
        left = targetRect.left + targetRect.width / 2
    }

    return {
      position: 'fixed' as const,
      top: `${Math.max(20, Math.min(window.innerHeight - 450, top))}px`,
      left: `${Math.max(20, Math.min(window.innerWidth - 450, left - 200))}px`,
    }
  }

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1s'
              }}
            >
              {['🎉', '✨', '🚀', '💎', '⭐', '🏆'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* Main Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 backdrop-blur-sm" onClick={skipTutorial}>
        
        {/* Animated Spotlight */}
        {targetRect && !isCenter && (
          <>
            <div 
              className="absolute border-4 border-purple-400 rounded-xl shadow-2xl transition-all duration-500 ease-out"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.8)',
                animation: 'tutorial-glow 2s infinite ease-in-out'
              }}
            />
            
            {/* Pulsing dot indicator */}
            <div 
              className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-ping"
              style={{
                top: targetRect.top + targetRect.height / 2 - 8,
                left: targetRect.left + targetRect.width / 2 - 8,
              }}
            />
          </>
        )}

        {/* Enhanced Tooltip */}
        <div 
          className={`absolute bg-white rounded-3xl shadow-2xl max-w-lg w-[450px] z-10 transform transition-all duration-500 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          } ${stepCompleted ? 'scale-105' : ''}`}
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl" />
          
          {/* Content */}
          <div className="relative p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {currentStepData.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Premium Feature</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={skipTutorial}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="space-y-4 mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {currentStepData.content}
              </p>
              
              {currentStepData.actionText && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">Action Step:</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    {currentStepData.actionText}
                  </p>
                </div>
              )}
              
              {currentStepData.proTip && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Pro Tip:</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1 font-medium">
                    {currentStepData.proTip}
                  </p>
                </div>
              )}
              
              {currentStepData.challenge && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-800">Challenge:</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1 font-medium">
                    {currentStepData.challenge}
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-semibold mb-3">
                <span className="text-gray-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span className="text-purple-600">{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-white opacity-30 rounded-full transition-all duration-700"
                  style={{ 
                    width: `${progress}%`,
                    animation: 'shimmer 2s infinite'
                  }}
                />
              </div>
              {progress > 50 && (
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded-full">
                    🔥 You're on fire! Keep going!
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={skipTutorial}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                Skip Tour
              </button>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all transform hover:scale-105"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-20 transform skew-x-12 -translate-x-full animate-shimmer" />
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      <Rocket className="w-5 h-5" />
                      Let's Dominate! 🚀
                    </>
                  ) : (
                    <>
                      Next Amazing Feature
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @keyframes tutorial-glow {
          0%, 100% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.6);
          }
          50% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 1);
          }
        }
        
        @keyframes tutorial-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skew(-12deg); }
          100% { transform: translateX(200%) skew(-12deg); }
        }
        
        @keyframes animate-shimmer {
          0% { transform: translateX(-100%) skew(-12deg); }
          100% { transform: translateX(200%) skew(-12deg); }
        }
        
        .animate-shimmer {
          animation: animate-shimmer 2s infinite;
        }
        
        @media (max-width: 768px) {
          .tutorial-tooltip {
            max-width: 90vw !important;
            width: 90vw !important;
            margin: 0 5vw !important;
          }
        }
        
        @media (max-width: 480px) {
          .tutorial-tooltip {
            max-width: 95vw !important;
            width: 95vw !important;
            margin: 0 2.5vw !important;
          }
        }
      `}</style>
    </>
  )
}

export default GrowflyTutorial