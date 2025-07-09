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
  X, ChevronRight, ArrowRight, 
  BarChart3, Image, Bookmark, Users, GraduationCap, 
  Handshake, Settings, Sparkles, Zap, Lightbulb, Mail
} from 'lucide-react'

// ========================= COMPONENT PROPS INTERFACES =========================

interface GrowflyTutorialProps {
  isFirstTime?: boolean
  autoplay?: boolean // Accepted but ignored for backward compatibility
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
  showSkipModal: boolean
  isAnimating: boolean
  hasStarted: boolean
}

type SlideshowAction = 
  | { type: 'ACTIVATE' }
  | { type: 'DEACTIVATE' }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREV_SLIDE' }
  | { type: 'SET_SLIDE'; payload: number }
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
    id: 'email-assistant',
    title: 'Email Assistant — Coming Very Soon! 📧',
    text: 'Your AI-powered email companion that reads, understands, and drafts professional responses using your brand voice. Generate professional email responses in seconds, perfectly matched to your brand voice.',
    subtext: 'Instant AI Responses • Smart Event Detection • Smart Task Management',
    icon: <Mail className="w-6 h-6" />,
    emoji: '📧',
    color: 'from-emerald-500 to-teal-500'
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
        showSkipModal: false,
        hasStarted: true
      }
    
    case 'DEACTIVATE':
      return {
        ...state,
        isActive: false,
        currentSlide: 0,
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

const useKeyboardNavigation = (
  isActive: boolean,
  handlers: {
    onNext: () => void
    onPrev: () => void
    onEscape: () => void
  }
) => {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, (event: KeyboardEvent) => void> = {
        'Escape': () => handlers.onEscape(),
        'ArrowRight': () => handlers.onNext(),
        'ArrowLeft': () => handlers.onPrev(),
        'Enter': () => handlers.onNext()
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
  <div className="flex justify-center gap-2 mb-4">
    {Array.from({ length: total }, (_, i) => (
      <button
        key={i}
        onClick={() => onSlideSelect(i)}
        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
          i === current 
            ? 'bg-white scale-125 shadow-lg' 
            : 'bg-white/30 hover:bg-white/50'
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
    <div className="fixed inset-0 bg-black/70 z-[90] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform scale-100 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-200 dark:border-orange-700 shadow-lg">
            <X className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skip Dashboard Tour?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm">
            This quick tour shows you the key features of your Growfly dashboard. 
            You can always restart it later from Settings.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200"
            >
              Continue Tour
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
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
      {/* Compact Icon Section */}
      <div className="text-center mb-5">
        <div className={`w-14 h-14 bg-gradient-to-br ${slide.color} rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-xl transform hover:scale-105 transition-all duration-200`}>
          {slide.icon}
        </div>
        <div className="text-3xl mb-2" role="img" aria-label={`${slide.emoji} emoji`}>
          {slide.emoji}
        </div>
      </div>

      {/* Compact Content Section */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          {slide.title}
        </h2>
        
        {isListSlide ? (
          <div className="text-left bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4 shadow-inner">
            <div className="space-y-2">
              {slide.text.split('\n').map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.replace('• ', '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-sm">
            {slide.text}
          </p>
        )}
        
        {slide.subtext && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-inner">
            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium italic">
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

  // Stop animation after delay
  useEffect(() => {
    if (state.isAnimating) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ANIMATING', payload: false })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [state.isAnimating, dispatch])

  // Keyboard navigation
  useKeyboardNavigation(state.isActive, {
    onNext: handleNext,
    onPrev: handlePrev,
    onEscape: handleSkip
  })

  if (!state.isActive || !currentSlide) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-indigo-700/95 to-purple-800/95 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Main Modal - Compact Size & Spacing */}
      <div className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-sm">
          
          {/* Enhanced Header with better styling */}
          <div className={`relative bg-gradient-to-br ${currentSlide.color} p-4 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold">Dashboard Tour</h1>
                <p className="text-white/90 text-sm">
                  Slide {state.currentSlide + 1} of {slides.length}
                </p>
              </div>
              
              <button
                onClick={handleSkip}
                className="w-10 h-10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                aria-label="Skip tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Enhanced Progress Bar with glow effect */}
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
              <div 
                className="h-1.5 bg-white rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Compact Slide Content with enhanced styling */}
          <div className="p-5">
            <SlideContent slide={currentSlide} isAnimating={state.isAnimating} />
          </div>

          {/* Enhanced Compact Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
            <SlideIndicators 
              total={slides.length} 
              current={state.currentSlide}
              onSlideSelect={(index) => dispatch({ type: 'SET_SLIDE', payload: index })}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isFirstSlide && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                )}
              </div>
              
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 ${
                  isLastSlide
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
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
  autoplay, // Accepted but ignored
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
        dispatch({ type: 'ACTIVATE' })
      }, 500) // Small delay for better UX
    }
  }, [isFirstTime, hasSeenTour])

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
        className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        {children}
      </button>
      
      <GrowflyTutorial
        isFirstTime={showSlideshow}
        onComplete={() => setShowSlideshow(false)}
      />
    </>
  )
}

// ========================= DEMO COMPONENT =========================

function SlideshowDemo(): React.ReactElement {
  const [showSlideshow, setShowSlideshow] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Demo Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Improved Growfly Tutorial ✨
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Enhanced design • Email Assistant feature • No autoplay • Better UX
          </p>
        </div>

        {/* Enhanced Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">📧 Email Assistant</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              New slide featuring the upcoming Email Assistant with AI-powered email responses and smart task management.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🚫 No Autoplay</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Removed autoplay functionality for better user control and manual navigation experience.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">✨ Enhanced Design</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Larger modal, better spacing, enhanced gradients, and improved visual hierarchy throughout.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">⚡ Cleaner Navigation</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Removed bottom-left skip button, improved button placement and enhanced keyboard navigation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">📊 All Features Intact</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              LocalStorage, keyboard navigation, skip modal, and progress tracking all preserved and enhanced.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🔧 Same API</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Perfect drop-in replacement with same props, exports, and integration - just improved!
            </p>
          </div>
        </div>

        {/* Demo Button */}
        <div className="flex justify-center">
          <LaunchTourButton className="px-12 py-6 text-xl">
            🎯 Launch Improved Tour
          </LaunchTourButton>
        </div>

        {/* Key Improvements Summary */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-3xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">🎉 Key Improvements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
            <div>
              <p><strong>✅ Added Email Assistant slide</strong> with coming soon features</p>
              <p><strong>✅ Removed autoplay functionality</strong> for manual control</p>
              <p><strong>✅ Removed bottom-left skip button</strong> for cleaner UI</p>
            </div>
            <div>
              <p><strong>✅ Enhanced modal size</strong> and improved spacing</p>
              <p><strong>✅ Better gradients and colors</strong> throughout</p>
              <p><strong>✅ Improved button placement</strong> and styling</p>
            </div>
          </div>
        </div>
      </div>
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