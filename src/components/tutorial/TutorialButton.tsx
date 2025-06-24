'use client'

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo, 
  useReducer,
  createContext,
  useContext,
  ReactNode
} from 'react'
import { 
  X, ChevronRight, ArrowRight, Play, Pause, 
  BarChart3, Image, Bookmark, Users, GraduationCap, 
  Handshake, Settings, Sparkles, Zap, Lightbulb
} from 'lucide-react'

// ========================= COMPONENT PROPS INTERFACES =========================

interface GrowflyTutorialProps {
  isFirstTime?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

interface GrowflySlideshowProps extends GrowflyTutorialProps {}

interface LaunchTourButtonProps {
  className?: string
  children?: ReactNode
}

// ========================= TYPES & INTERFACES =========================

interface SlideContent {
  id: string
  title: string
  text: string
  subtext?: string
  icon: ReactNode
  emoji: string
  color: string
}

interface SlideshowState {
  isActive: boolean
  currentSlide: number
  isAutoPlaying: boolean
  showSkipModal: boolean
  isAnimating: boolean
  hasStarted: boolean
}

type SlideshowAction = 
  | { type: 'ACTIVATE'; payload?: { autoplay?: boolean } }
  | { type: 'DEACTIVATE' }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREV_SLIDE' }
  | { type: 'SET_SLIDE'; payload: number }
  | { type: 'TOGGLE_AUTOPLAY' }
  | { type: 'SHOW_SKIP_MODAL'; payload: boolean }
  | { type: 'SET_ANIMATING'; payload: boolean }
  | { type: 'MARK_STARTED' }

interface SlideshowContextValue {
  state: SlideshowState
  dispatch: React.Dispatch<SlideshowAction>
  slides: SlideContent[]
}

// ========================= SLIDE CONTENT =========================

const SLIDES: SlideContent[] = [
  {
    id: 'welcome',
    title: 'Welcome to Growfly — Your AI-Powered Business Sidekick 🚀',
    text: 'Growfly is your distraction-free, AI productivity platform designed for entrepreneurs, creators and teams. Let\'s show you around the key parts of your dashboard so you can get the most out of it from Day 1.',
    icon: <Sparkles className="w-6 h-6" />,
    emoji: '🚀',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'xp-tracker',
    title: 'Your XP Score — See Your Progress in Real Time 📊',
    text: 'Every prompt you run earns you XP. You\'ll level up through fun titles like "Just Curious" and "Prompt Commander". More XP = More mastery, smarter responses, and unlockable perks.',
    icon: <BarChart3 className="w-6 h-6" />,
    emoji: '📊',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gallery',
    title: 'Gallery — Your AI-Generated Visuals in One Place 🖼️',
    text: 'Every image you generate with Growfly is saved here automatically. Download, review or reuse them whenever you like — from product visuals to marketing mockups.',
    icon: <Image className="w-6 h-6" />,
    emoji: '🖼️',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'saved',
    title: 'Saved — Bookmark Your Best Ideas 💡',
    text: 'Keep your favourite responses handy. From content drafts to clever answers, you can title and revisit your saved AI responses anytime in one tidy tab.',
    icon: <Bookmark className="w-6 h-6" />,
    emoji: '💡',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'collab-zone',
    title: 'Collab Zone — Edit Together, Anywhere ✍️',
    text: 'Create, edit and collaborate on live documents with your team. Work in real-time, add comments, and export to Word or PDF. Perfect for brainstorming, reports or planning together.',
    icon: <Users className="w-6 h-6" />,
    emoji: '✍️',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'education-hub',
    title: 'Education Hub — Level Up Your Skills 📚',
    text: 'Packed with prompt examples, AI how-tos, and tips to sharpen your creativity. Whether you\'re new to AI or want to push further, the Education Hub helps you stay ahead.',
    icon: <GraduationCap className="w-6 h-6" />,
    emoji: '📚',
    color: 'from-teal-500 to-blue-500'
  },
  {
    id: 'trusted-partners',
    title: 'Trusted Partners — Pre-Vetted Tools We Trust 🤖',
    text: 'Explore a curated list of tools, platforms, and expert services we trust to help you grow your business — from automation and branding to finance and legal support.',
    icon: <Handshake className="w-6 h-6" />,
    emoji: '🤖',
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'brand-settings',
    title: 'Brand Settings — Smarter AI Starts Here 🎯',
    text: 'Tell Growfly about your brand: tone of voice, audience, industry, and goals. The more we know, the better the AI responses match your brand identity.',
    subtext: 'Customise once. Get tailored responses forever.',
    icon: <Settings className="w-6 h-6" />,
    emoji: '🎯',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'wishlist',
    title: 'Wishlist — The Place Where Dreams Come True ✨',
    text: 'Got an idea? Drop it in the Wishlist. Suggest new tools, features or AI use cases for your business. The most upvoted ones get built by our nerds (seriously). If your idea gets picked, we\'ll even reward you.',
    subtext: 'Shape the future of Growfly with your ideas.',
    icon: <Lightbulb className="w-6 h-6" />,
    emoji: '✨',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'other-features',
    title: 'Even More Awesomeness Awaits ⚡',
    text: '• Refer a Friend: Earn bonus prompts\n• Change Plan: Upgrade as you grow\n• Account Settings: Manage your info and preferences\n• Support: We\'re always here if you need help',
    icon: <Zap className="w-6 h-6" />,
    emoji: '⚡',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'final',
    title: 'You\'re All Set to Start Using Growfly 🦋',
    text: 'Try your first prompt, explore your dashboard, and let the AI do the heavy lifting. You\'ve got this — and we\'ve got your back.',
    icon: <Sparkles className="w-6 h-6" />,
    emoji: '🦋',
    color: 'from-cyan-500 to-blue-500'
  }
]

// ========================= UTILITY FUNCTIONS =========================

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// ========================= SLIDESHOW REDUCER =========================

const initialSlideshowState: SlideshowState = {
  isActive: false,
  currentSlide: 0,
  isAutoPlaying: false,
  showSkipModal: false,
  isAnimating: false,
  hasStarted: false
}

const slideshowReducer = (state: SlideshowState, action: SlideshowAction): SlideshowState => {
  switch (action.type) {
    case 'ACTIVATE':
      return {
        ...state,
        isActive: true,
        currentSlide: 0,
        isAutoPlaying: action.payload?.autoplay ?? false,
        showSkipModal: false,
        hasStarted: true
      }
    
    case 'DEACTIVATE':
      return {
        ...state,
        isActive: false,
        currentSlide: 0,
        isAutoPlaying: false,
        showSkipModal: false,
        isAnimating: false
      }
    
    case 'NEXT_SLIDE':
      return {
        ...state,
        currentSlide: Math.min(state.currentSlide + 1, SLIDES.length - 1),
        isAnimating: true
      }
    
    case 'PREV_SLIDE':
      return {
        ...state,
        currentSlide: Math.max(0, state.currentSlide - 1),
        isAnimating: true
      }
    
    case 'SET_SLIDE':
      return {
        ...state,
        currentSlide: action.payload,
        isAnimating: true
      }
    
    case 'TOGGLE_AUTOPLAY':
      return {
        ...state,
        isAutoPlaying: !state.isAutoPlaying
      }
    
    case 'SHOW_SKIP_MODAL':
      return {
        ...state,
        showSkipModal: action.payload
      }
    
    case 'SET_ANIMATING':
      return {
        ...state,
        isAnimating: action.payload
      }
    
    case 'MARK_STARTED':
      return {
        ...state,
        hasStarted: true
      }
    
    default:
      return state
  }
}

// ========================= CUSTOM HOOKS =========================

const useLocalStorage = <T extends unknown>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

const useAutoplay = (
  isActive: boolean,
  isAutoPlaying: boolean,
  currentSlide: number,
  totalSlides: number,
  onNext: () => void,
  onComplete: () => void
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && isAutoPlaying && currentSlide < totalSlides - 1) {
      intervalRef.current = setInterval(() => {
        onNext()
      }, 5000) // 5 seconds per slide
    } else if (isActive && isAutoPlaying && currentSlide === totalSlides - 1) {
      // Auto-complete on final slide
      setTimeout(() => {
        onComplete()
      }, 5000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isAutoPlaying, currentSlide, totalSlides, onNext, onComplete])
}

const useKeyboardNavigation = (
  isActive: boolean,
  handlers: {
    onNext: () => void
    onPrev: () => void
    onEscape: () => void
    onToggleAutoplay: () => void
  }
) => {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, (event: KeyboardEvent) => void> = {
        'Escape': () => handlers.onEscape(),
        'ArrowRight': () => handlers.onNext(),
        'ArrowLeft': () => handlers.onPrev(),
        'Enter': () => handlers.onNext(),
        ' ': (event: KeyboardEvent) => { event.preventDefault(); handlers.onToggleAutoplay() }
      }

      const handler = keyMap[e.key]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [isActive, handlers])
}

// ========================= SLIDESHOW CONTEXT =========================

const SlideshowContext = createContext<SlideshowContextValue | null>(null)

export const useSlideshow = () => {
  const context = useContext(SlideshowContext)
  if (!context) {
    throw new Error('useSlideshow must be used within a SlideshowProvider')
  }
  return context
}

interface SlideIndicatorsProps {
  total: number
  current: number
  onSlideSelect: (index: number) => void
}

interface SkipModalProps {
  isVisible: boolean
  onConfirm: () => void
  onCancel: () => void
}

interface SlideContentProps {
  slide: SlideContent
  isAnimating: boolean
}

// ========================= COMPONENTS =========================

const SlideIndicators: React.FC<SlideIndicatorsProps> = ({ 
  total, 
  current, 
  onSlideSelect 
}) => (
  <div className="flex justify-center gap-1.5 mb-4">
    {Array.from({ length: total }, (_, i) => (
      <button
        key={i}
        onClick={() => onSlideSelect(i)}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i === current 
            ? 'bg-white scale-125 shadow-lg' 
            : 'bg-white/40 hover:bg-white/60'
        }`}
        aria-label={`Go to slide ${i + 1}`}
      />
    ))}
  </div>
)

const SkipModal: React.FC<SkipModalProps> = ({ 
  isVisible, 
  onConfirm, 
  onCancel 
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform scale-100 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-200 dark:border-orange-700">
            <X className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skip Dashboard Tour?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            This quick tour shows you the key features of your Growfly dashboard. 
            You can always restart it later from Settings.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
            >
              Continue Tour
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SlideContent: React.FC<SlideContentProps> = ({ 
  slide, 
  isAnimating 
}) => {
  const isListSlide = slide.text.includes('•')
  
  return (
    <div className={`transition-all duration-500 ${isAnimating ? 'opacity-75 scale-98' : 'opacity-100 scale-100'}`}>
      {/* Icon Section */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 bg-gradient-to-r ${slide.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
          {slide.icon}
        </div>
        <div className="text-4xl mb-3" role="img" aria-label={`${slide.emoji} emoji`}>
          {slide.emoji}
        </div>
      </div>

      {/* Content Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {slide.title}
        </h2>
        
        {isListSlide ? (
          <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
            <div className="space-y-2">
              {slide.text.split('\n').map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.replace('• ', '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {slide.text}
          </p>
        )}
        
        {slide.subtext && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 italic">
              {slide.subtext}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const SlideshowModal: React.FC = () => {
  const { state, dispatch, slides } = useSlideshow()
  
  const currentSlide = slides[state.currentSlide]
  const progress = ((state.currentSlide + 1) / slides.length) * 100
  const isFirstSlide = state.currentSlide === 0
  const isLastSlide = state.currentSlide === slides.length - 1

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      dispatch({ type: 'DEACTIVATE' })
    } else {
      dispatch({ type: 'NEXT_SLIDE' })
    }
  }, [isLastSlide, dispatch])

  const handlePrev = useCallback(() => {
    if (state.currentSlide > 0) {
      dispatch({ type: 'PREV_SLIDE' })
    }
  }, [state.currentSlide, dispatch])

  const handleSkip = useCallback(() => {
    dispatch({ type: 'SHOW_SKIP_MODAL', payload: true })
  }, [dispatch])

  const handleToggleAutoplay = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTOPLAY' })
  }, [dispatch])

  // Stop animation after delay
  useEffect(() => {
    if (state.isAnimating) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ANIMATING', payload: false })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [state.isAnimating, dispatch])

  // Autoplay functionality
  useAutoplay(
    state.isActive,
    state.isAutoPlaying,
    state.currentSlide,
    slides.length,
    handleNext,
    () => dispatch({ type: 'DEACTIVATE' })
  )

  // Keyboard navigation
  useKeyboardNavigation(state.isActive, {
    onNext: handleNext,
    onPrev: handlePrev,
    onEscape: handleSkip,
    onToggleAutoplay: handleToggleAutoplay
  })

  if (!state.isActive || !currentSlide) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-indigo-700/95 to-purple-800/95 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Main Modal - Compact Size */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${currentSlide.color} p-4 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAutoplay}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all"
                  aria-label={state.isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
                >
                  {state.isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div>
                  <h1 className="text-lg font-bold">Dashboard Tour</h1>
                  <p className="text-sm text-white/80">
                    Slide {state.currentSlide + 1} of {slides.length}
                    {state.isAutoPlaying && ' • Auto-playing'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSkip}
                className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                aria-label="Skip tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-1.5 bg-white rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Slide Content - Compact */}
          <div className="p-6">
            <SlideContent slide={currentSlide} isAnimating={state.isAnimating} />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4">
            <SlideIndicators 
              total={slides.length} 
              current={state.currentSlide}
              onSlideSelect={(index) => dispatch({ type: 'SET_SLIDE', payload: index })}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Skip Tour
                </button>
                {!isFirstSlide && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                )}
              </div>
              
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
                  isLastSlide
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {isLastSlide ? (
                  <>
                    Get Started
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================= MAIN TUTORIAL COMPONENT =========================

const GrowflyTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  autoplay = false,
  onComplete
}) => {
  const [state, dispatch] = useReducer(slideshowReducer, initialSlideshowState)
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('growfly-tutorial-completed', false)

  const contextValue: SlideshowContextValue = useMemo(() => ({
    state,
    dispatch,
    slides: SLIDES
  }), [state, dispatch])

  // Initialize slideshow
  useEffect(() => {
    if (isFirstTime && !hasSeenTour) {
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.body.style.overflow = 'hidden'
        }
        dispatch({ type: 'ACTIVATE', payload: { autoplay } })
      }, 500) // Small delay for better UX
    }
  }, [isFirstTime, autoplay, hasSeenTour])

  // Cleanup
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  }, [])

  const handleComplete = useCallback(() => {
    dispatch({ type: 'DEACTIVATE' })
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
    setHasSeenTour(true)
    onComplete?.()
  }, [onComplete, setHasSeenTour])

  const handleSkipConfirm = useCallback(() => {
    dispatch({ type: 'SHOW_SKIP_MODAL', payload: false })
    handleComplete()
  }, [handleComplete])

  const handleSkipCancel = useCallback(() => {
    dispatch({ type: 'SHOW_SKIP_MODAL', payload: false })
  }, [])

  // Handle modal close
  useEffect(() => {
    if (!state.isActive && state.hasStarted) {
      handleComplete()
    }
  }, [state.isActive, state.hasStarted, handleComplete])

  return (
    <SlideshowContext.Provider value={contextValue}>
      {state.isActive && (
        <>
          <SlideshowModal />
          
          <SkipModal
            isVisible={state.showSkipModal}
            onConfirm={handleSkipConfirm}
            onCancel={handleSkipCancel}
          />
        </>
      )}
    </SlideshowContext.Provider>
  )
}

// ========================= SLIDESHOW ALIAS =========================

const GrowflySlideshow: React.FC<GrowflySlideshowProps> = GrowflyTutorial

// ========================= LAUNCH TOUR COMPONENT =========================

const LaunchTourButton: React.FC<LaunchTourButtonProps> = ({ 
  className = "",
  children = "Launch Tour"
}) => {
  const [showSlideshow, setShowSlideshow] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowSlideshow(true)}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg ${className}`}
      >
        <Play className="w-4 h-4" />
        {children}
      </button>
      
      <GrowflyTutorial
        isFirstTime={showSlideshow}
        autoplay={false}
        onComplete={() => setShowSlideshow(false)}
      />
    </>
  )
}

// ========================= DEMO COMPONENT =========================

function SlideshowDemo(): React.ReactElement {
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showAutoplaySlideshow, setShowAutoplaySlideshow] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Demo Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Modern Compact Tutorial 🚀
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Full-featured tutorial that fits perfectly on any screen
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">✨ All Original Features</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li>• Complete original functionality</li>
              <li>• LocalStorage persistence</li>
              <li>• All slide content preserved</li>
              <li>• Context provider system</li>
              <li>• Custom hooks maintained</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🎨 Modern Compact UI</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li>• Fits on screen (max-w-lg)</li>
              <li>• Beautiful color gradients</li>
              <li>• Smooth animations</li>
              <li>• Perfect mobile experience</li>
              <li>• Clean, modern design</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">⚡ Full Functionality</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li>• Autoplay with pause/play</li>
              <li>• Keyboard navigation</li>
              <li>• Skip tour modal</li>
              <li>• Progress tracking</li>
              <li>• Slide indicators</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🔧 Developer Ready</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li>• Same export structure</li>
              <li>• All original props/interfaces</li>
              <li>• Drop-in replacement</li>
              <li>• TypeScript complete</li>
              <li>• Production ready</li>
            </ul>
          </div>
        </div>

        {/* Demo Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowAutoplaySlideshow(true)}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5" />
            Demo: First-Time User (Autoplay)
          </button>
          
          <LaunchTourButton className="px-8 py-4 text-lg">
            🎯 Manual Launch Tour
          </LaunchTourButton>
        </div>

        {/* Integration Guide */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-3xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🔄 Perfect Drop-in Replacement</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p><strong>✅ Same API:</strong> All props, exports, and functionality preserved</p>
            <p><strong>✅ Same Imports:</strong> Use exactly the same import statements</p>
            <p><strong>✅ Same Features:</strong> LocalStorage, autoplay, skip modal, etc.</p>
            <p><strong>✅ Just Better:</strong> Compact, modern UI that always fits on screen</p>
          </div>
        </div>
      </div>

      {/* Demo Slideshows */}
      <GrowflyTutorial
        isFirstTime={showAutoplaySlideshow}
        autoplay={true}
        onComplete={() => setShowAutoplaySlideshow(false)}
      />
    </div>
  )
}

// ========================= EXPORTS =========================

// Default export - main tutorial component
export default GrowflyTutorial

// Named exports
export { GrowflySlideshow, SlideshowDemo, LaunchTourButton }

// Type exports for external use
export type { GrowflyTutorialProps, LaunchTourButtonProps }