import { create } from 'zustand'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('njangi_token', token)
      localStorage.setItem('njangi_user', JSON.stringify(user))
    }
    set({ user, token, isLoggedIn: true })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('njangi_token')
      localStorage.removeItem('njangi_user')
    }
    set({ user: null, token: null, isLoggedIn: false })
  },
}))