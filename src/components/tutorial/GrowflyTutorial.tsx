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
  Handshake, Settings, Sparkles, Zap, Lightbulb, Mail, Layout
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
    title: 'Welcome to Growfly — Your AI-Powered Business Sidekick',
    text: 'Growfly is your distraction-free AI productivity platform designed for entrepreneurs, creators and teams. Let\'s show you around the key parts of your dashboard so you can get the most out of it from Day 1.',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'dashboard-overview',
    title: 'Your Personalised Dashboard — Built Just for You',
    text: 'Your dashboard is designed to eliminate distractions and accelerate your workflow. Every element is tailored to your brand settings, helping you speed up processes, save valuable time, and dramatically improve your output quality.',
    subtext: 'Personalised advice • No distractions • Brand-perfected responses',
    icon: <Layout className="w-6 h-6" />,
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'email-assistant',
    title: 'Email Assistant — Coming Very Soon',
    text: 'Your AI-powered email companion that reads, understands, and drafts professional responses using your brand voice. It automatically creates to-do lists, schedules calendar invites, and manages meetings based on your email conversations.',
    subtext: 'Instant AI Responses • Smart Event Detection • Automatic Task Management • Calendar Integration',
    icon: <Mail className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'xp-tracker',
    title: 'Your XP Score — Track Your Progress in Real Time',
    text: 'Every prompt you run earns you experience points. You\'ll level up through engaging titles like "Just Curious" and "Prompt Commander". Higher XP means greater mastery, smarter AI responses, and exclusive unlockable perks.',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gallery',
    title: 'Gallery — Your AI-Generated Visuals in One Place',
    text: 'Every image you generate with Growfly is automatically saved and organised here. Download, review, or reuse them whenever you like — from product visuals and marketing mockups to social media content and presentations.',
    icon: <Image className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'saved',
    title: 'Saved — Bookmark Your Brilliant Ideas',
    text: 'Keep your favourite AI responses easily accessible. From content drafts and clever answers to strategic insights, you can title, categorise and revisit your saved AI responses anytime in one organised location.',
    icon: <Bookmark className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'collab-zone',
    title: 'Collab Zone — Collaborate Seamlessly, Anywhere',
    text: 'Create, edit and collaborate on live documents with your team in real-time. Add comments, track changes, and export to Word or PDF formats. Perfect for brainstorming sessions, detailed reports, or strategic planning together.',
    icon: <Users className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'education-hub',
    title: 'Education Hub — Continuously Level Up Your Skills',
    text: 'Packed with expertly crafted prompt examples, comprehensive AI how-to guides, and advanced tips to sharpen your creativity and productivity. Whether you\'re new to AI or looking to push boundaries, the Education Hub keeps you ahead of the curve.',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-teal-500 to-blue-500'
  },
  {
    id: 'trusted-partners',
    title: 'Trusted Partners — Pre-Vetted Tools We Recommend',
    text: 'Explore our carefully curated collection of tools, platforms, and expert services we trust to help accelerate your business growth — from automation and branding solutions to finance management and legal support.',
    icon: <Handshake className="w-6 h-6" />,
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'brand-settings',
    title: 'Brand Settings — Where Smarter AI Begins',
    text: 'Tell Growfly about your brand personality: tone of voice, target audience, industry focus, and business goals. The more detailed information we have, the better our AI responses will match your unique brand identity and messaging.',
    subtext: 'Customise once. Receive tailored responses forever.',
    icon: <Settings className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'wishlist',
    title: 'Wishlist — Where Your Dreams Become Reality',
    text: 'Have a brilliant idea? Submit it to the Wishlist. Suggest new tools, features, or AI use cases for your business. The most upvoted suggestions get built by our development team. If your idea gets selected, we\'ll reward you for your contribution.',
    subtext: 'Shape the future of Growfly with your innovative ideas.',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'other-features',
    title: 'Even More Powerful Features Await',
    text: '• Refer a Friend: Earn bonus prompts and exclusive rewards\n• Change Plan: Upgrade seamlessly as your business grows\n• Account Settings: Manage your information and preferences\n• Support: Our dedicated team is always here when you need assistance',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'final',
    title: 'You\'re All Set to Start Using Growfly',
    text: 'Try your first prompt, explore your personalised dashboard, and let our AI handle the heavy lifting. You\'ve got the tools for success — and we\'ve got your back every step of the way.',
    icon: <Sparkles className="w-6 h-6" />,
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
        className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ${
          i === current 
            ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/30 animate-pulse' 
            : 'bg-white/30 hover:bg-white/60 hover:shadow-md'
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
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Continue Tour
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400"
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
      {/* Compact Icon Section with simple animations */}
      <div className="text-center mb-5">
        <div className={`w-16 h-16 bg-gradient-to-br ${slide.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl transform transition-all hover:scale-110 hover:rotate-3`}>
          {slide.icon}
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {slide.title}
        </h2>
        
        {isListSlide ? (
          <div className="text-left bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4 shadow-inner">
            <div className="space-y-2">
              {slide.text.split('\n').map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0 shadow-sm animate-pulse"></div>
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
          <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl border border-cyan-200 dark:border-cyan-800 shadow-inner">
            <p className="text-xs text-cyan-800 dark:text-cyan-300 font-medium italic">
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
      
      {/* Main Modal */}
      <div className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-sm">
          
          {/* Enhanced Header */}
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
                className="w-10 h-10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Skip tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
              <div 
                className="h-1.5 bg-gradient-to-r from-white to-white/90 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-white/30"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Compact Slide Content */}
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                )}
              </div>
              
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 ${
                  isLastSlide
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl focus:ring-green-400'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:ring-blue-400'
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
        className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
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
            Enhanced Growfly Tutorial
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Growfly blue indicators • Enhanced animations • UK English • Improved content
          </p>
        </div>

        {/* Enhanced Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            { icon: <Mail className="w-8 h-8 text-white" />, title: 'Email Assistant Enhanced', desc: 'Added automatic to-do lists and calendar integration features', color: 'from-emerald-500 to-teal-500' },
            { icon: <Layout className="w-8 h-8 text-white" />, title: 'New Dashboard Slide', desc: 'Personalised advice, no distractions, brand-perfected responses', color: 'from-cyan-400 to-blue-500' },
            { icon: <Sparkles className="w-8 h-8 text-white" />, title: 'Smooth Animations', desc: 'Slide-in animations, hover effects, and smooth transitions throughout', color: 'from-purple-500 to-violet-500' },
            { icon: <BarChart3 className="w-8 h-8 text-white" />, title: 'Growfly Blue Indicators', desc: 'Current slide indicators now use authentic Growfly blue colour', color: 'from-cyan-400 to-blue-500' },
            { icon: <Settings className="w-8 h-8 text-white" />, title: 'Enhanced Content', desc: 'All content rewritten in proper UK English with expanded information', color: 'from-indigo-500 to-purple-500' },
            { icon: <ArrowRight className="w-8 h-8 text-white" />, title: 'Micro-interactions', desc: 'Button press animations, focus states, and enhanced accessibility', color: 'from-blue-500 to-indigo-500' }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Demo Button */}
        <div className="flex justify-center">
          <LaunchTourButton className="px-12 py-6 text-xl">
            Launch Enhanced Tour
          </LaunchTourButton>
        </div>

        {/* Key Improvements Summary */}
        <div className="mt-16 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-8 rounded-3xl border border-cyan-200 dark:border-cyan-800">
          <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">Latest Enhancements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
            <div>
              <p><strong>✅ Growfly blue slide indicators</strong> with pulse animation</p>
              <p><strong>✅ New personalised dashboard slide</strong> with key benefits</p>
              <p><strong>✅ Enhanced Email Assistant</strong> with calendar & task features</p>
              <p><strong>✅ Removed all emojis</strong> for cleaner presentation</p>
            </div>
            <div>
              <p><strong>✅ Comprehensive animations</strong> throughout interface</p>
              <p><strong>✅ UK English content</strong> with expanded information</p>
              <p><strong>✅ Enhanced accessibility</strong> with focus states</p>
              <p><strong>✅ Micro-interactions</strong> for premium feel</p>
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