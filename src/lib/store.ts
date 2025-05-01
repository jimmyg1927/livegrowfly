import { create } from 'zustand'

type User = {
  name?: string
  email?: string
}

interface UserState {
  user: User
  setUser: (user: User) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: { name: 'Growfly User' },
  setUser: (user) => set({ user }),
}))
