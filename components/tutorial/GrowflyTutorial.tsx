'use client'

import React, { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { Sparkles, Zap, Users, Heart, Lightbulb, Trophy, Handshake, Settings, Image, BookOpen } from 'lucide-react'

interface GrowflyTutorialProps {
  isFirstTime?: boolean
  onComplete?: () => void
}

const GrowflyTutorial: React.FC<GrowflyTutorialProps> = ({ 
  isFirstTime = false,
  onComplete 
}) => {
  const [runTutorial, setRunTutorial] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Listen for custom event from settings page
  useEffect(() => {
    const handleStartTour = () => {
      setTimeout(() => setRunTutorial(true), 500)
    }

    window.addEventListener('startGrowflyTour', handleStartTour)
    
    return () => {
      window.removeEventListener('startGrowflyTour', handleStartTour)
    }
  }, [])

  useEffect(() => {
    if (isFirstTime) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => setRunTutorial(true), 1000)
    }
  }, [isFirstTime])

  const tutorialSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="tutorial-welcome">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome to Growfly! 🚀</h2>
              <p className="text-gray-600">Your AI-powered business growth companion</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Growfly is designed to supercharge your business with AI that's uniquely tailored to YOU. 
            With new features added daily, you're about to discover a powerful tool that will transform 
            how you create content, collaborate, and grow your business.
          </p>
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-purple-400">
            <p className="text-sm font-medium text-purple-800">
              💡 Pro Tip: Complete this 2-minute tour to unlock your full potential!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-lg text-gray-800">1. The Command Center 🎯</h3>
          </div>
          <p className="text-gray-700 mb-3">
            This is where the magic happens! Ask Growfly anything about your business, upload images, 
            create stunning visuals, and get AI responses that are powerful and unique to YOUR brand.
          </p>
          <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400 mb-3">
            <p className="text-sm font-medium text-green-800">
              ✨ Try asking: "Create a social media post about our latest product"
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Upload files and images for AI analysis</li>
            <li>• Generate custom content for your business</li>
            <li>• Get personalized AI recommendations</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="saved-responses"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg text-gray-800">2. Your Treasure Chest 💎</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Save your favorite Growfly responses here! Edit them, refine them, and keep your best 
            AI-generated content organized and ready to use whenever inspiration strikes.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mb-3">
            <p className="text-sm font-medium text-blue-800">
              💡 Pro Tip: Build your personal library of winning content templates!
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Bookmark your best AI responses</li>
            <li>• Edit and customize saved content</li>
            <li>• Quick access to proven templates</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="collab-zone"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg text-gray-800">3. Team Collaboration Hub 🤝</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Share your AI responses with team members, collaborate in real-time, edit content together, 
            and download polished responses. Teamwork makes the dream work!
          </p>
          <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400 mb-3">
            <p className="text-sm font-medium text-purple-800">
              🚀 Perfect for: Marketing teams, content creators, and agencies
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Share responses with your team instantly</li>
            <li>• Collaborative editing and feedback</li>
            <li>• Download final versions in multiple formats</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="gallery"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-lg text-gray-800">4. Your Art Gallery 🎨</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Every masterpiece Growfly creates for you lives here! Browse through all your AI-generated 
            artwork, images, and visual content in one beautiful, organized gallery.
          </p>
          <div className="bg-pink-50 p-3 rounded-lg border-l-4 border-pink-400 mb-3">
            <p className="text-sm font-medium text-pink-800">
              🎨 Watch your creative portfolio grow with every request!
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• View all your AI-generated visuals</li>
            <li>• Organize by project or campaign</li>
            <li>• Easy download and sharing options</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="education-hub"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg text-gray-800">5. Master the AI Game 🎓</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Learn the best tips, tricks, and strategies for using Growfly and AI in general. 
            Discover how to maximize your business growth with cutting-edge AI techniques.
          </p>
          <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400 mb-3">
            <p className="text-sm font-medium text-indigo-800">
              📚 From beginner to AI expert - we've got you covered!
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Expert tutorials and guides</li>
            <li>• Best practices for prompt engineering</li>
            <li>• Business growth strategies with AI</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="wishlist"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-lg text-gray-800">6. Shape the Future 💡</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Got a brilliant idea? Share it here! Suggest updates and cool features you'd love to see. 
            Our development nerds work on the most favorited ideas to make your dreams reality.
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 mb-3">
            <p className="text-sm font-medium text-yellow-800">
              🌟 Your ideas drive our roadmap - you have the power!
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Submit feature requests and ideas</li>
            <li>• Vote on community suggestions</li>
            <li>• See your ideas come to life</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="trusted-partners"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-lg text-gray-800">7. Bridge to Success 🌉</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Coming soon! We're building connections between AI and human professionals who can take 
            your business that final step. The perfect blend of artificial and human intelligence.
          </p>
          <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400 mb-3">
            <p className="text-sm font-medium text-green-800">
              🚀 The future of work: AI + human expertise = unstoppable growth
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Connect with verified professionals</li>
            <li>• Seamless AI-to-human handoffs</li>
            <li>• Expert services for complex projects</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="brand-settings"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-gray-500" />
            <h3 className="font-bold text-lg text-gray-800">8. Your Brand DNA 🧬</h3>
          </div>
          <p className="text-gray-700 mb-3">
            This is where Growfly learns about YOU and your business. Tweak your brand settings here - 
            your voice, style, and preferences. You can update this anytime as your business evolves.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400 mb-3">
            <p className="text-sm font-medium text-gray-800">
              🎯 The more Growfly knows about you, the better it serves you!
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Define your brand voice and tone</li>
            <li>• Set business goals and preferences</li>
            <li>• Update settings as you grow</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="xp-system"]',
      content: (
        <div className="tutorial-step">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-gray-800">9. Level Up & Get Rewarded 🏆</h3>
          </div>
          <p className="text-gray-700 mb-3">
            The more you use Growfly, the higher you level up! Top-ranking users get amazing rewards 
            like gift cards, exclusive event invitations, networking opportunities, and so much more.
          </p>
          <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400 mb-3">
            <p className="text-sm font-medium text-amber-800">
              🎮 Gaming meets business growth - earn while you learn!
            </p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Earn XP for every interaction</li>
            <li>• Unlock exclusive rewards and perks</li>
            <li>• Join our elite network of power users</li>
          </ul>
        </div>
      ),
      placement: 'left',
    },
    {
      target: 'body',
      content: (
        <div className="tutorial-finale">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">You're Ready to Fly! 🚀</h2>
            <p className="text-lg text-gray-600">Congratulations! You've completed the Growfly tutorial.</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 mb-4">
            <h3 className="font-bold text-lg text-purple-800 mb-3">🎯 Quick Start Challenge:</h3>
            <ol className="space-y-2 text-sm text-purple-700">
              <li><strong>1.</strong> Ask Growfly to create your first social media post</li>
              <li><strong>2.</strong> Save your favorite response to Saved Responses</li>
              <li><strong>3.</strong> Share it with your team in Collab Zone</li>
              <li><strong>4.</strong> Watch your XP grow as you explore!</li>
            </ol>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-l-4 border-green-400">
            <p className="text-sm font-medium text-gray-700">
              <strong>Remember:</strong> You can replay this tutorial anytime from Settings → Tutorial. 
              Now go ahead and ask me any questions to get started!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    }
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTutorial(false)
      localStorage.setItem('growfly-tutorial-completed', 'true')
      if (onComplete) onComplete()
    }
  }

  return (
    <>
      <Joyride
        steps={tutorialSteps}
        run={runTutorial}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '12px',
            padding: '0',
            maxWidth: '400px',
            fontSize: '14px',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipContent: {
            padding: '20px',
          },
          buttonNext: {
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
          },
          buttonBack: {
            color: '#6b7280',
            marginRight: '8px',
            fontSize: '14px',
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: '12px',
          },
          spotlight: {
            borderRadius: '8px',
          },
          beacon: {
            animation: 'joyride-beacon 1.2s infinite ease-in-out',
          }
        }}
        locale={{
          back: '← Back',
          close: 'Close',
          last: 'Let\'s Go! 🚀',
          next: 'Next →',
          skip: 'Skip Tour',
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />
      
      <style jsx global>{`
        @keyframes joyride-beacon {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .tutorial-welcome,
        .tutorial-step,
        .tutorial-finale {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        @media (max-width: 768px) {
          .__floater__body {
            max-width: 90vw !important;
          }
          
          .tutorial-welcome,
          .tutorial-step,
          .tutorial-finale {
            font-size: 14px;
          }
          
          .tutorial-welcome h2,
          .tutorial-step h3,
          .tutorial-finale h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  )
}

export default GrowflyTutorial