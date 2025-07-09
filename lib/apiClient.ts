// lib/apiClient.ts
import { API_BASE_URL } from '@lib/constants'

interface ApiResponse<T = any> {
  data?: T
  newToken?: string
  error?: string
  code?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private refreshPromise: Promise<string> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Always prefer localStorage for cross-domain reliability
    const localToken = localStorage.getItem('growfly_jwt')
    if (localToken) {
      console.log('🔑 Found token in localStorage')
      return localToken
    }
    
    // Fallback to cookies (might not work cross-domain)
    const cookieToken = this.getCookieToken()
    if (cookieToken) {
      console.log('🔑 Found token in cookies')
      // If found in cookies but not localStorage, sync them
      localStorage.setItem('growfly_jwt', cookieToken)
      return cookieToken
    }
    
    console.log('🔑 No token found anywhere')
    return null
  }

  private getCookieToken(): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'growfly_jwt') {
        return decodeURIComponent(value)
      }
    }
    return null
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return
    
    console.log('🔧 Setting token:', token.substring(0, 20) + '...')
    
    // ✅ PRIMARY: Always store in localStorage (works cross-domain)
    localStorage.setItem('growfly_jwt', token)
    console.log('✅ Token stored in localStorage')
    
    // ✅ SECONDARY: Try to store in cookies (may fail cross-domain)
    try {
      this.setCookieToken(token)
      console.log('✅ Token stored in cookies')
    } catch (error) {
      console.warn('⚠️ Cookie storage failed (cross-domain?), localStorage will handle auth')
    }
    
    // ✅ VERIFICATION: Ensure storage worked
    setTimeout(() => {
      const stored = localStorage.getItem('growfly_jwt')
      const cookieStored = this.getCookieToken()
      console.log('🔍 Verification:')
      console.log('  - localStorage has token:', !!stored)
      console.log('  - cookie has token:', !!cookieStored)
      
      if (!stored) {
        console.error('❌ CRITICAL: Token not stored in localStorage!')
      }
    }, 100)
  }

  private setCookieToken(token: string): void {
    if (typeof document === 'undefined') return
    
    const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
    const isProduction = process.env.NODE_ENV === 'production'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // ✅ Cross-domain cookie settings
    let cookieString = `growfly_jwt=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/`
    
    if (isProduction) {
      // Production: Secure cookies with cross-domain support
      cookieString += '; SameSite=None; Secure'
      // Try to set domain for growfly.io subdomains
      if (window.location.hostname.includes('growfly.io')) {
        cookieString += '; Domain=.growfly.io'
      }
    } else if (isDevelopment) {
      // Development: Relaxed settings for localhost
      cookieString += '; SameSite=Lax'
    } else {
      // Default: Safe settings
      cookieString += '; SameSite=Lax'
    }
    
    document.cookie = cookieString
    console.log('🍪 Cookie set:', cookieString)
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return
    
    console.log('🗑️ Removing tokens from all storage')
    
    // ✅ Remove from localStorage
    localStorage.removeItem('growfly_jwt')
    
    // ✅ Remove from cookies (all possible variations)
    this.removeCookieToken()
    
    console.log('✅ Tokens removed from all storage')
  }

  private removeCookieToken(): void {
    if (typeof document === 'undefined') return
    
    // Remove with different domain/path combinations to be thorough
    const expireDate = 'expires=Thu, 01 Jan 1970 00:00:00 UTC'
    const variations = [
      `growfly_jwt=; ${expireDate}; Path=/`,
      `growfly_jwt=; ${expireDate}; Path=/; Domain=.growfly.io`,
      `growfly_jwt=; ${expireDate}; Path=/; SameSite=None; Secure`,
      `growfly_jwt=; ${expireDate}; Path=/; SameSite=Lax`,
    ]
    
    variations.forEach(cookieString => {
      try {
        document.cookie = cookieString
      } catch (error) {
        // Ignore errors for cross-domain cookie removal
      }
    })
  }

  private async refreshToken(): Promise<string> {
    // If refresh is already in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    
    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<string> {
    const currentToken = this.getToken()
    if (!currentToken) {
      throw new Error('No token to refresh')
    }

    console.log('🔄 Attempting token refresh...')

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      } as Record<string, string>,
    })

    if (!response.ok) {
      console.log('❌ Token refresh failed')
      this.removeToken()
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    if (!data.token) {
      console.log('❌ No token in refresh response')
      this.removeToken()
      throw new Error('No token in refresh response')
    }

    console.log('✅ Token refreshed successfully')
    this.setToken(data.token)
    return data.token
  }

  private async request<T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    console.log(`🌐 ${options.method || 'GET'} ${this.baseURL}${url}`)

    let response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: headers as HeadersInit,
    })

    // Handle expired token
    if (response.status === 401) {
      console.log('🔒 401 Unauthorized - checking token expiry...')
      const errorData = await response.json()
      
      if (errorData.code === 'TOKEN_EXPIRED' && errorData.refreshable) {
        console.log('🔄 Token expired but refreshable, attempting refresh...')
        try {
          // Try to refresh the token
          const newToken = await this.refreshToken()
          
          // Retry the original request with new token
          headers.Authorization = `Bearer ${newToken}`
          console.log('🔄 Retrying original request with new token...')
          response = await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers: headers as HeadersInit,
          })
        } catch (refreshError) {
          // Refresh failed, redirect to login
          console.log('❌ Token refresh failed, redirecting to login')
          this.removeToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return { error: 'Session expired. Please log in again.' }
        }
      } else {
        // Token is invalid, redirect to login
        console.log('❌ Token invalid, redirecting to login')
        this.removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return { error: 'Session expired. Please log in again.' }
      }
    }

    const data = await response.json()
    console.log(`📦 Response:`, { status: response.status, hasData: !!data })

    // ✅ Auto-update token if server provides a new one
    if (data.newToken) {
      console.log('🔄 Auto-updating token from server response')
      this.setToken(data.newToken)
    }

    if (!response.ok) {
      console.log('❌ API Error:', data.error || 'Request failed')
      return { error: data.error || 'Request failed' }
    }

    // ✅ For auth endpoints, also check for token in main response
    if (data.token) {
      console.log('🔑 Found token in main response, storing...')
      this.setToken(data.token)
    }

    return { data }
  }

  // ✅ HTTP Methods
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async patch<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' })
  }

  // ✅ Utility method to verify authentication
  async verifyAuth(): Promise<boolean> {
    const token = this.getToken()
    if (!token) {
      console.log('🔒 No token available for verification')
      return false
    }

    try {
      console.log('🔍 Verifying authentication...')
      const result = await this.get('/api/auth/me')
      const isValid = !result.error && !!result.data
      console.log('🔍 Auth verification result:', isValid)
      return isValid
    } catch (error) {
      console.log('🔍 Auth verification failed:', error)
      return false
    }
  }
}

// ✅ Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// ✅ Helper function for auth operations with enhanced logging
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('🔐 === LOGIN API CALL STARTED ===')
    const result = await apiClient.post('/api/auth/login', { email, password })
    
    if (result.data?.token) {
      console.log('✅ Login successful, token stored')
      // Verify authentication immediately
      setTimeout(() => apiClient.verifyAuth(), 100)
    } else {
      console.log('❌ Login failed:', result.error)
    }
    
    return result
  },
  
  signup: async (userData: any) => {
    console.log('🚀 === SIGNUP API CALL STARTED ===')
    console.log('🚀 Signup data:', userData)
    const result = await apiClient.post('/api/auth/signup', userData)
    
    if (result.data?.token) {
      console.log('✅ Signup successful, token stored in localStorage and cookies')
      // Verify authentication immediately
      setTimeout(() => apiClient.verifyAuth(), 100)
    } else {
      console.log('❌ Signup failed:', result.error)
    }
    
    return result
  },
  
  getMe: () => {
    console.log('👤 Getting user data...')
    return apiClient.get('/api/auth/me')
  },
  
  getReferralData: () =>
    apiClient.get('/api/auth/referral-data'),
  
  refresh: () => {
    console.log('🔄 Manual token refresh...')
    return apiClient.post('/api/auth/refresh', {})
  },

  // ✅ New method for pre-navigation verification
  verifyBeforeNavigation: async (): Promise<boolean> => {
    console.log('🔍 === PRE-NAVIGATION AUTH CHECK ===')
    const hasToken = !!localStorage.getItem('growfly_jwt')
    console.log('🔍 Has token in localStorage:', hasToken)
    
    if (!hasToken) {
      console.log('❌ No token found, navigation will fail')
      return false
    }
    
    const isValid = await apiClient.verifyAuth()
    console.log('🔍 Token is valid:', isValid)
    
    return isValid
  }
}

// ✅ Type definitions for better TypeScript support
export interface User {
  id: string
  email: string
  name: string
  subscriptionType: string
  promptLimit: number
  promptsUsed: number
  totalXP: number
  hasCompletedOnboarding: boolean
  stripeCustomerId?: string
  billingStartDate?: string
  jobTitle?: string
  industry?: string
  brandName?: string
  brandDescription?: string
  brandVoice?: string
  brandMission?: string
  inspiredBy?: string
  referralCode?: string
  referralCredits?: number
}

export interface LoginResponse {
  token: string
  hasCompletedOnboarding: boolean
  intendedPlan?: string
  user: User
}