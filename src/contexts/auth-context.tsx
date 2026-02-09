import * as React from 'react'
import type { User, Role } from '@/types'
import { login as apiLogin, verify2FA as apiVerify2FA } from '@/api/auth'

interface SessionPending2FA {
  sessionId: string
  email: string
  role: Role
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionPending2FA: SessionPending2FA | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role?: Role) => Promise<void>
  loginWithRole: (email: string, password: string, role: Role) => Promise<{ requires2FA: boolean }>
  verify2FA: (sessionId: string, code: string) => Promise<void>
  clearPending2FA: () => void
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
    sessionPending2FA: null,
  })

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const user = JSON.parse(raw) as User
        setState((s) => ({ ...s, user, isAuthenticated: true, isLoading: false }))
        return
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setState((s) => ({ ...s, isLoading: false }))
  }, [])

  const loginWithRole = React.useCallback(
    async (email: string, password: string, role: Role): Promise<{ requires2FA: boolean }> => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const res = await apiLogin(email, password, role)
        if (res.requires2FA && res.sessionId) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            sessionPending2FA: { sessionId: res.sessionId, email, role },
          })
          return { requires2FA: true }
        }
        if (res.user) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.user))
          setState({
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
            sessionPending2FA: null,
          })
          return { requires2FA: false }
        }
        throw new Error('Invalid response')
      } catch {
        setState((s) => ({ ...s, isLoading: false }))
        throw new Error('Invalid email or password')
      }
    },
    []
  )

  const login = React.useCallback(
    async (email: string, password: string, role?: Role) => {
      await loginWithRole(email, password, role ?? 'buyer')
    },
    [loginWithRole]
  )

  const verify2FA = React.useCallback(async (sessionId: string, code: string) => {
    setState((s) => ({ ...s, isLoading: true }))
    try {
      const { user } = await apiVerify2FA(sessionId, code)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        sessionPending2FA: null,
      })
    } catch {
      setState((s) => ({ ...s, isLoading: false }))
      throw new Error('Invalid verification code')
    }
  }, [])

  const clearPending2FA = React.useCallback(() => {
    setState((s) => ({ ...s, sessionPending2FA: null }))
  }, [])

  const signup = React.useCallback(
    async (email: string, _password: string, role: string) => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const user: User = {
          id: crypto.randomUUID(),
          email,
          displayName: email.split('@')[0],
          role: role as Role,
          emailVerified: false,
          createdAt: new Date().toISOString(),
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        setState({ user, isAuthenticated: true, isLoading: false, sessionPending2FA: null })
      } finally {
        setState((s) => ({ ...s, isLoading: false }))
      }
    },
    []
  )

  const logout = React.useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setState({ user: null, isAuthenticated: false, isLoading: false, sessionPending2FA: null })
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    loginWithRole,
    verify2FA,
    clearPending2FA,
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
