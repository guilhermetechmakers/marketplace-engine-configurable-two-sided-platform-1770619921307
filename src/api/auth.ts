import type { User, Role, TwoFactorSetup } from '@/types'
import { apiPost, apiGet, type ApiError } from '@/lib/api'

export interface LoginResponse {
  user?: User
  requires2FA?: boolean
  sessionId?: string
}

/** Login with email/password. Returns user or sessionId if 2FA required. */
export async function login(
  email: string,
  password: string,
  role: Role
): Promise<LoginResponse> {
  try {
    return await apiPost<LoginResponse>('/auth/login', { email, password, role })
  } catch {
    return mockLogin(email, password, role)
  }
}

/** Verify 2FA code and complete login. */
export async function verify2FA(
  sessionId: string,
  code: string
): Promise<{ user: User }> {
  try {
    return await apiPost<{ user: User }>('/auth/verify-2fa', { sessionId, code })
  } catch {
    return mockVerify2FA(sessionId, code)
  }
}

/** Begin 2FA setup - returns secret and QR URL. */
export async function setup2FA(): Promise<TwoFactorSetup> {
  try {
    return await apiGet<TwoFactorSetup>('/auth/2fa/setup')
  } catch {
    return mockSetup2FA()
  }
}

/** Enable 2FA with verified code. */
export async function enable2FA(secret: string, code: string): Promise<{ success: boolean }> {
  try {
    return await apiPost<{ success: boolean }>('/auth/2fa/enable', { secret, code })
  } catch {
    return mockEnable2FA(secret, code)
  }
}

/** Disable 2FA (requires password). */
export async function disable2FA(password: string): Promise<{ success: boolean }> {
  try {
    return await apiPost<{ success: boolean }>('/auth/2fa/disable', { password })
  } catch {
    return { success: true }
  }
}

const MOCK_2FA_SESSION_KEY = 'marketplace_2fa_pending'

/** Mock implementations for development without backend */
function mockLogin(email: string, _password: string, role: Role): LoginResponse {
  const isAdmin = role === 'admin'
  const isModerator = role === 'moderator'
  const moderatorWith2FA = isModerator && (email.includes('2fa') || email.includes('mod'))

  if (isAdmin || moderatorWith2FA) {
    const sessionId = `mock-session-${crypto.randomUUID()}`
    try {
      sessionStorage.setItem(MOCK_2FA_SESSION_KEY, JSON.stringify({ sessionId, email, role }))
    } catch {
      //
    }
    return { requires2FA: true, sessionId }
  }

  const user: User = {
    id: crypto.randomUUID(),
    email,
    displayName: email.split('@')[0],
    role,
    emailVerified: true,
    twoFactorEnabled: isAdmin || moderatorWith2FA,
    createdAt: new Date().toISOString(),
  }
  return { user }
}

function mockVerify2FA(sessionId: string, code: string): Promise<{ user: User }> {
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    throw new Error('Invalid verification code')
  }
  let email = 'admin@marketplace.example'
  let role: Role = 'admin'
  try {
    const raw = sessionStorage.getItem(MOCK_2FA_SESSION_KEY)
    if (raw) {
      const data = JSON.parse(raw) as { sessionId: string; email: string; role: Role }
      if (data.sessionId === sessionId) {
        email = data.email
        role = data.role
        sessionStorage.removeItem(MOCK_2FA_SESSION_KEY)
      }
    }
  } catch {
    //
  }
  const user: User = {
    id: crypto.randomUUID(),
    email,
    displayName: email.split('@')[0],
    role,
    emailVerified: true,
    twoFactorEnabled: true,
    createdAt: new Date().toISOString(),
  }
  return Promise.resolve({ user })
}

function mockSetup2FA(): Promise<TwoFactorSetup> {
  const secret = 'JBSWY3DPEHPK3PXP'
  return Promise.resolve({
    secret,
    qrCodeUrl: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fff" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">${secret}</text></svg>`)}`,
  })
}

function mockEnable2FA(_secret: string, code: string): Promise<{ success: boolean }> {
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    throw new Error('Invalid verification code')
  }
  return Promise.resolve({ success: true })
}

export { type ApiError }
