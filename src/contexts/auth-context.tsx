import * as React from 'react'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'marketplace_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const user = JSON.parse(raw) as User
        setState({ user, isAuthenticated: true, isLoading: false })
        return
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setState((s) => ({ ...s, isLoading: false }))
  }, [])

  const login = React.useCallback(async (email: string, _password: string) => {
    setState((s) => ({ ...s, isLoading: true }))
    try {
      // Placeholder: replace with real api call
      const user: User = {
        id: '1',
        email,
        displayName: email.split('@')[0],
        role: 'buyer',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      setState({ user, isAuthenticated: true, isLoading: false })
    } finally {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  const signup = React.useCallback(
    async (email: string, _password: string, role: string) => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const user: User = {
          id: crypto.randomUUID(),
          email,
          displayName: email.split('@')[0],
          role: role as User['role'],
          emailVerified: false,
          createdAt: new Date().toISOString(),
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        setState({ user, isAuthenticated: true, isLoading: false })
      } finally {
        setState((s) => ({ ...s, isLoading: false }))
      }
    },
    []
  )

  const logout = React.useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
