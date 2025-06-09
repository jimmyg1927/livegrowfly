// types/user.ts - User type definitions

export interface User {
  id: string
  email: string
  name?: string
  linkedIn?: string
  jobTitle?: string
  industry?: string
  narrative?: string
  goals?: string
  
  // Brand information
  brandName?: string
  brandDescription?: string
  brandValues?: string
  brandTone?: string
  brandVoice?: string
  brandMission?: string
  audienceType?: string
  audienceInterests?: string
  locationFocus?: string
  platformFocus?: string
  primaryProducts?: string
  USP?: string
  inspiredBy?: string
  
  // Subscription and usage
  promptsUsed: number
  promptLimit: number
  subscriptionType: string
  billingStartDate?: Date | string | null
  isEnterprise: boolean
  stripeCustomerId?: string | null
  usersAllowed: number
  totalXP: number
  
  // Image generation tracking (optional, might not exist on all users)
  imagesGeneratedToday?: number
  imagesGeneratedThisMonth?: number
  lastImageGeneratedDate?: Date | string | null
  lastImageResetDate?: Date | string | null
  
  // Other fields
  hasCompletedOnboarding: boolean
  mustChangePassword: boolean
  referralCode?: string | null
  referralCredits: number
  referredById?: string | null
  shop?: string | null
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface AuthResponse {
  token: string
  hasCompletedOnboarding: boolean
  user?: User
  intendedPlan?: string
}

export interface SubscriptionBadge {
  label: string
  color: string
  icon: string | null
}

export type SubscriptionType = 'free' | 'personal' | 'business' | 'enterprise'