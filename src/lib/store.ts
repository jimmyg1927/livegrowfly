import { create } from 'zustand'

type User = {
  name?: string
  email?: string
  promptLimit: number
  promptsUsed: number
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
  },
  xp: 0,
  subscriptionType: 'Free',
  setUser: (user) => set({ user }),
  setXp: (xp) => set({ xp }),
  setSubscriptionType: (type) => set({ subscriptionType: type }),
}))
