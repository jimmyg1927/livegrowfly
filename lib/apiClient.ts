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
    
    // Try localStorage first, then cookies as fallback
    const localToken = localStorage.getItem('growfly_jwt')
    if (localToken) return localToken
    
    // Fallback to cookies
    return this.getCookieToken()
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
    
    // ✅ Store in both localStorage AND cookies
    localStorage.setItem('growfly_jwt', token)
    this.setCookieToken(token)
  }

  private setCookieToken(token: string): void {
    if (typeof document === 'undefined') return
    
    // Set cookie with same settings as middleware expects
    const isProduction = process.env.NODE_ENV === 'production'
    const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
    
    document.cookie = `growfly_jwt=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return
    
    // ✅ Remove from both localStorage AND cookies
    localStorage.removeItem('growfly_jwt')
    this.removeCookieToken()
  }

  private removeCookieToken(): void {
    if (typeof document === 'undefined') return
    
    // Set cookie with past expiration date to remove it
    document.cookie = 'growfly_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/; SameSite=Lax'
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

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      } as Record<string, string>,
    })

    if (!response.ok) {
      this.removeToken()
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    if (!data.token) {
      this.removeToken()
      throw new Error('No token in refresh response')
    }

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

    let response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: headers as HeadersInit,
    })

    // Handle expired token
    if (response.status === 401) {
      const errorData = await response.json()
      
      if (errorData.code === 'TOKEN_EXPIRED' && errorData.refreshable) {
        try {
          // Try to refresh the token
          const newToken = await this.refreshToken()
          
          // Retry the original request with new token
          headers.Authorization = `Bearer ${newToken}`
          response = await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers: headers as HeadersInit,
          })
        } catch (refreshError) {
          // Refresh failed, redirect to login
          this.removeToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return { error: 'Session expired. Please log in again.' }
        }
      } else {
        // Token is invalid, redirect to login
        this.removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return { error: 'Session expired. Please log in again.' }
      }
    }

    const data = await response.json()

    // ✅ Auto-update token if server provides a new one
    if (data.newToken) {
      console.log('🔄 Auto-updating token from server response')
      this.setToken(data.newToken)
    }

    if (!response.ok) {
      return { error: data.error || 'Request failed' }
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
}

// ✅ Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// ✅ Helper function for auth operations
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('🔐 Login API call started')
    const result = await apiClient.post('/api/auth/login', { email, password })
    
    if (result.data?.token) {
      console.log('✅ Login successful, token stored')
    } else {
      console.log('❌ Login failed:', result.error)
    }
    
    return result
  },
  
  signup: async (userData: any) => {
    console.log('🚀 Signup API call started')
    const result = await apiClient.post('/api/auth/signup', userData)
    
    if (result.data?.token) {
      console.log('✅ Signup successful, token stored in localStorage and cookies')
    } else {
      console.log('❌ Signup failed:', result.error)
    }
    
    return result
  },
  
  getMe: () =>
    apiClient.get('/api/auth/me'),
  
  getReferralData: () =>
    apiClient.get('/api/auth/referral-data'),
  
  refresh: () =>
    apiClient.post('/api/auth/refresh', {}),
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