import { create } from 'zustand'

type User = {
  name?: string
  email?: string
  promptLimit: number
  promptsUsed: number
  totalXP: number
  subscriptionType: string
}

interface UserState {
  user: User
  xp: number
  subscriptionType: string
  setUser: (user: User) => void
  setXp: (xp: number) => void
  setSubscriptionType: (type: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    name: 'Growfly User',
    email: '',
    promptLimit: 0,
    promptsUsed: 0,
    totalXP: 0,
    subscriptionType: 'free',
  },
  xp: 0, // onboarding XP (local only)
  subscriptionType: 'free',

  // ✅ Sets full user object from backend / me route
  setUser: (user) => {
    set({ user, xp: user.totalXP || 0, subscriptionType: user.subscriptionType || 'free' })
  },

  // ✅ Sets XP progress locally — useful during onboarding
  setXp: (xp) => set((state) => ({
    xp,
    user: { ...state.user, totalXP: xp },
  })),

  // ✅ Sets sub type manually
  setSubscriptionType: (type) => set({ subscriptionType: type }),
}))
