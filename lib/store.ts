// File: src/lib/store.ts
import { create } from 'zustand'

export type User = {
  // Core auth fields
  id: string
  name?: string
  email: string

  // Subscription & limits
  subscriptionType: string
  promptsUsed: number
  promptLimit: number
  usersAllowed?: number
  isEnterprise?: boolean

  // Billing
  billingStartDate?: string
  stripeCustomerId?: string

  // Referral
  referralCode?: string
  referredById?: string

  // XP
  totalXP: number

  // ✅ IMAGE PROPERTIES - Added from Prisma schema
  imagesGeneratedToday?: number
  imagesGeneratedThisMonth?: number
  lastImageGeneratedDate?: string
  lastImageResetDate?: string

  // Onboarding fields
  jobTitle?: string
  industry?: string
  brandName?: string
  brandDescription?: string
  brandVoice?: string
  brandMission?: string
  inspiredBy?: string
  goals?: string
}

interface UserState {
  user: User
  xp: number             // local XP (e.g. onboarding bar)
  subscriptionType: string

  setUser: (user: User) => void
  setXp: (xp: number) => void
  setSubscriptionType: (type: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  // ✅ UPDATED: Initial defaults (before /api/auth/me) - This is Fix 3
  user: {
    id: '',
    name: undefined,
    email: '',
    subscriptionType: 'free',
    promptsUsed: 0,
    promptLimit: 0,
    usersAllowed: 1,
    isEnterprise: false,
    billingStartDate: undefined,
    stripeCustomerId: undefined,
    referralCode: undefined,
    referredById: undefined,
    totalXP: 0,
    
    // ✅ NEW: Image generation defaults
    imagesGeneratedToday: 0,
    imagesGeneratedThisMonth: 0,
    lastImageGeneratedDate: undefined,
    lastImageResetDate: undefined,
    
    jobTitle: undefined,
    industry: undefined,
    brandName: undefined,
    brandDescription: undefined,
    brandVoice: undefined,
    brandMission: undefined,
    inspiredBy: undefined,
    goals: undefined,
  },

  xp: 0,
  subscriptionType: 'free',

  // Populate store from backend `/api/auth/me`
  setUser: (user) =>
    set({
      user,
      xp: user.totalXP,
      subscriptionType: user.subscriptionType,
    }),

  // Local XP updates (e.g. onboarding progress)
  setXp: (xp) =>
    set((state) => ({
      xp,
      user: { ...state.user, totalXP: xp },
    })),

  // Manually override subscription type
  setSubscriptionType: (type) => set({ subscriptionType: type }),
}))