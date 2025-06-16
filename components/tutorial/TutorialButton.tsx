'use client'

import React, { useState } from 'react'
import { Play, Sparkles, RotateCcw } from 'lucide-react'

interface TutorialButtonProps {
  onStartTutorial: () => void
  className?: string
}

const TutorialButton: React.FC<TutorialButtonProps> = ({ onStartTutorial, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  const hasCompletedTutorial = typeof window !== 'undefined' 
    ? localStorage.getItem('growfly-tutorial-completed') === 'true' 
    : false

  return (
    <div className={`tutorial-button-container ${className}`}>
      <button
        onClick={onStartTutorial}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative w-full p-6 rounded-xl border-2 transition-all duration-300 
          ${isHovered 
            ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg transform -translate-y-1' 
            : 'border-gray-200 bg-white hover:border-purple-300'
          }
        `}
      >
        {/* Background animation */}
        <div className={`
          absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 
          transition-opacity duration-300 ${isHovered ? 'opacity-10' : ''}
        `} />
        
        {/* Content */}
        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
            ${isHovered 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg' 
              : 'bg-gradient-to-r from-purple-400 to-pink-400'
            }
          `}>
            {hasCompletedTutorial ? (
              <RotateCcw className={`w-6 h-6 text-white transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
            ) : (
              <Play className={`w-6 h-6 text-white transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} />
            )}
          </div>
          
          {/* Text Content */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-bold text-lg transition-colors duration-300 ${isHovered ? 'text-purple-700' : 'text-gray-800'}`}>
                {hasCompletedTutorial ? 'Replay Tutorial' : 'Take the Growfly Tour'}
              </h3>
              <Sparkles className={`w-4 h-4 transition-all duration-300 ${isHovered ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`} />
            </div>
            
            <p className={`text-sm leading-relaxed transition-colors duration-300 ${isHovered ? 'text-purple-600' : 'text-gray-600'}`}>
              {hasCompletedTutorial 
                ? 'Want to go through the tutorial again? Refresh your knowledge of all Growfly features and discover any updates you might have missed.'
                : 'New to Growfly? Take our interactive 2-minute tour to discover all the amazing features that will supercharge your business growth!'
              }
            </p>
            
            <div className={`mt-3 text-xs font-medium transition-colors duration-300 ${isHovered ? 'text-purple-500' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {hasCompletedTutorial ? 'Click to restart the interactive tour' : '2 minutes • Interactive highlights • Mobile friendly'}
              </span>
            </div>
          </div>
          
          {/* Arrow indicator */}
          <div className={`
            flex-shrink-0 transition-all duration-300 
            ${isHovered ? 'transform translate-x-1 text-purple-500' : 'text-gray-400'}
          `}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* Completion badge for completed users */}
        {hasCompletedTutorial && (
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </button>
      
      {/* Additional info for new users */}
      {!hasCompletedTutorial && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
            <span className="font-medium">Recommended for new users</span>
          </div>
          <p className="text-xs text-blue-600 mt-1 ml-6">
            Get the most out of Growfly by learning about all our powerful features
          </p>
        </div>
      )}
    </div>
  )
}

export default TutorialButton