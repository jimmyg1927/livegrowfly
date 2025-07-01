// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*', '/dashboard'],
}

async function tryRefreshToken(expiredToken: string): Promise<string | null> {
  try {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!refreshRes.ok) return null

    const data = await refreshRes.json()
    return data.token || null
  } catch (error) {
    console.error('Token refresh failed in middleware:', error)
    return null
  }
}

async function fetchUserWithToken(token: string): Promise<any> {
  try {
    const apiRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store' // Ensure fresh data
      }
    )
    
    if (!apiRes.ok) {
      const errorData = await apiRes.json()
      
      // If token expired but refreshable, try refresh
      if (errorData.code === 'TOKEN_EXPIRED' && errorData.refreshable) {
        const newToken = await tryRefreshToken(token)
        if (newToken) {
          // Retry with new token
          const retryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
            { 
              headers: { Authorization: `Bearer ${newToken}` },
              cache: 'no-store'
            }
          )
          
          if (retryRes.ok) {
            const userData = await retryRes.json()
            return { user: userData, newToken }
          }
        }
      }
      
      throw new Error('Invalid token')
    }
    
    const userData = await apiRes.json()
    
    // Check if server provided a new token
    const newToken = userData.newToken
    if (newToken) {
      delete userData.newToken // Remove from user data
      return { user: userData, newToken }
    }
    
    return { user: userData }
  } catch (error) {
    throw error
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // ─── CORS SUPPORT FOR /api ───────────────────────────────────────────────────
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      res.headers.set('Access-Control-Allow-Origin', 'https://app.growfly.io')
      res.headers.set('Access-Control-Allow-Credentials', 'true')
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      return res
    }
    const res = NextResponse.next()
    res.headers.set('Access-Control-Allow-Origin', 'https://app.growfly.io')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    return res
  }

  // ─── PROTECT /dashboard ──────────────────────────────────────────────────────
  if (req.nextUrl.pathname === '/dashboard') {
    // 1) Check JWT (cookie or Authorization header)
    const jwt =
      req.cookies.get('growfly_jwt')?.value ||
      req.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!jwt) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    try {
      // 2) Fetch user data (with automatic token refresh)
      const result = await fetchUserWithToken(jwt)
      const user = result.user
      const newToken = result.newToken

      // 3) Check exactly the fields you collect in onboarding
      const required = [
        'brandName',
        'brandDescription',
        'brandVoice',
        'brandMission',
        'inspiredBy',
        'jobTitle',
        'industry',
        'goals',
      ]
      const incomplete = required.some((f) => !user[f])
      
      if (incomplete) {
        url.pathname = '/onboarding'
        const response = NextResponse.redirect(url)
        
        // ✅ Set new token in response if available
        if (newToken) {
          response.cookies.set('growfly_jwt', newToken, {
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
          })
        }
        
        return response
      }

      // ✅ Continue to dashboard, but set new token if provided
      if (newToken) {
        const response = NextResponse.next()
        response.cookies.set('growfly_jwt', newToken, {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        })
        return response
      }

    } catch (error) {
      console.error('Dashboard middleware error:', error)
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      
      // Clear invalid token
      response.cookies.delete('growfly_jwt')
      
      return response
    }
  }

  // Otherwise, let the request through
  return NextResponse.next()
}