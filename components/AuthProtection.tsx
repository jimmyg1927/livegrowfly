// File: components/AuthProtection.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthProtectionProps {
  children: React.ReactNode
}

export default function AuthProtection({ children }: AuthProtectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ✅ Routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register', 
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/onboarding',
    '/contact',
    '/terms',
    '/privacy',
    '/not-found',
    '/404',
    '/confirm-payment',
    '/payment-success'
  ]

  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('growfly_jwt')
        
        if (!token) {
          setIsAuthenticated(false)
          setIsLoading(false)
          
          // ✅ Redirect to login if trying to access protected route
          if (!isPublicRoute && pathname !== '/') {
            router.push('/login')
          }
          return
        }

        // ✅ Verify token is still valid (optional - your middleware handles this too)
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            setIsAuthenticated(true)
            
            // ✅ Redirect authenticated users away from auth pages
            if (pathname === '/login' || pathname === '/register' || pathname === '/signup') {
              router.push('/dashboard')
            }
          } else {
            // ✅ Token invalid, remove it and redirect to login
            localStorage.removeItem('growfly_jwt')
            setIsAuthenticated(false)
            
            if (!isPublicRoute && pathname !== '/') {
              router.push('/login')
            }
          }
        } catch (apiError) {
          // ✅ API call failed, but we still have a token - let middleware handle it
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        
        if (!isPublicRoute && pathname !== '/') {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // ✅ Listen for storage changes (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'growfly_jwt' && !e.newValue) {
        setIsAuthenticated(false)
        if (!isPublicRoute && pathname !== '/') {
          router.push('/login')
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [pathname, router, isPublicRoute])

  // ✅ Show loading spinner while checking auth (only for very brief moment)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading Growfly...</p>
        </div>
      </div>
    )
  }

  // ✅ For public routes, always show content
  if (isPublicRoute) {
    return <>{children}</>
  }

  // ✅ For protected routes, show content if authenticated (middleware will handle actual protection)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}