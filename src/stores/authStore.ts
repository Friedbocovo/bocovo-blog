import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'visitor'
  avatar: string | null
  bio: string | null
  website: string | null
  social_links: Record<string, string> | null
}

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
}

/**
 * Store d'authentification avec persistance localStorage.
 * Les données sont stockées sous la clé 'blog-visitor-auth'.
 * Le client Axios (src/lib/api.ts) lit ce store pour injecter le Bearer token.
 */
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      /** Stocke le token et les infos utilisateur après login/register */
      setToken: (token: string, user: User) => set({ token, user }),

      /** Met à jour les infos utilisateur sans changer le token */
      setUser: (user: User) => set({ user }),

      /** Efface le token et l'utilisateur (logout) */
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'blog-visitor-auth',
      // On ne persiste que token et user, pas les actions
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

export default useAuthStore
