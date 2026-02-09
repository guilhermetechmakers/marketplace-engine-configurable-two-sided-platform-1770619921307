import type {
  SettingsPreferences,
  UserProfileSettings,
  NotificationPreferences,
  SavedCard,
  SavedBankAccount,
  UserSession,
} from '@/types'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'

const PREFIX = '/settings/preferences'

/** Fetch user's settings/preferences list. */
export async function getSettingsPreferences(): Promise<SettingsPreferences[]> {
  try {
    return await apiGet<SettingsPreferences[]>(PREFIX)
  } catch {
    return []
  }
}

/** Create a settings/preferences record. */
export async function createSettingsPreference(
  data: Pick<SettingsPreferences, 'title' | 'description'>
): Promise<SettingsPreferences> {
  return apiPost<SettingsPreferences>(PREFIX, { ...data, status: 'active' })
}

/** Update a settings/preferences record. */
export async function updateSettingsPreference(
  id: string,
  data: Partial<Pick<SettingsPreferences, 'title' | 'description' | 'status'>>
): Promise<SettingsPreferences> {
  return apiPatch<SettingsPreferences>(`${PREFIX}/${id}`, data)
}

/** Delete a settings/preferences record. */
export async function deleteSettingsPreference(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/${id}`)
}

/** Get profile settings (name, bio, location, language). */
export async function getProfileSettings(): Promise<UserProfileSettings | null> {
  try {
    return await apiGet<UserProfileSettings>(`${PREFIX}/profile`)
  } catch {
    return null
  }
}

/** Update profile settings. */
export async function updateProfileSettings(
  data: Partial<UserProfileSettings>
): Promise<UserProfileSettings> {
  return apiPut<UserProfileSettings>(`${PREFIX}/profile`, data)
}

/** Get notification preferences per event type. */
export async function getNotificationPreferences(): Promise<
  NotificationPreferences[]
> {
  try {
    return await apiGet<NotificationPreferences[]>(`${PREFIX}/notifications`)
  } catch {
    return getDefaultNotificationPreferences()
  }
}

/** Update notification preferences. */
export async function updateNotificationPreferences(
  prefs: NotificationPreferences[]
): Promise<NotificationPreferences[]> {
  try {
    return await apiPut<NotificationPreferences[]>(
      `${PREFIX}/notifications`,
      prefs
    )
  } catch {
    return prefs
  }
}

function getDefaultNotificationPreferences(): NotificationPreferences[] {
  const types: NotificationPreferences['eventType'][] = [
    'orders',
    'messages',
    'listings',
    'reviews',
    'payouts',
    'promotions',
    'security',
  ]
  return types.map((eventType) => ({
    eventType,
    email: true,
    push: false,
    inApp: true,
  }))
}

/** Get saved payment methods (cards). */
export async function getSavedCards(): Promise<SavedCard[]> {
  try {
    return await apiGet<SavedCard[]>(`${PREFIX}/payment-methods/cards`)
  } catch {
    return []
  }
}

/** Add a payment method (card). */
export async function addCard(data: {
  token?: string
  last4: string
  brand: string
  expMonth: number
  expYear: number
}): Promise<SavedCard> {
  return apiPost<SavedCard>(`${PREFIX}/payment-methods/cards`, data)
}

/** Remove a payment method. */
export async function removeCard(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/payment-methods/cards/${id}`)
}

/** Set default card. */
export async function setDefaultCard(id: string): Promise<void> {
  await apiPatch(`${PREFIX}/payment-methods/cards/${id}/default`, {})
}

/** Get saved bank accounts (for sellers). */
export async function getSavedBankAccounts(): Promise<SavedBankAccount[]> {
  try {
    return await apiGet<SavedBankAccount[]>(`${PREFIX}/payment-methods/banks`)
  } catch {
    return []
  }
}

/** Add bank account. */
export async function addBankAccount(data: {
  bankName: string
  last4: string
}): Promise<SavedBankAccount> {
  return apiPost<SavedBankAccount>(`${PREFIX}/payment-methods/banks`, data)
}

/** Remove bank account. */
export async function removeBankAccount(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/payment-methods/banks/${id}`)
}

/** Change password. */
export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${PREFIX}/security/change-password`, data)
}

/** Get active sessions. */
export async function getSessions(): Promise<UserSession[]> {
  try {
    return await apiGet<UserSession[]>(`${PREFIX}/security/sessions`)
  } catch {
    return []
  }
}

/** Revoke a session. */
export async function revokeSession(id: string): Promise<void> {
  await apiDelete(`${PREFIX}/security/sessions/${id}`)
}

/** Request data export. */
export async function requestDataExport(): Promise<{ requestId: string }> {
  return apiPost<{ requestId: string }>(`${PREFIX}/privacy/export`, {})
}

/** Request account deletion. */
export async function requestAccountDeletion(data: {
  password: string
  confirmation: string
}): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${PREFIX}/privacy/delete-account`, data)
}

export interface ConsentOption {
  id: string
  label: string
  description?: string
  enabled: boolean
}

/** Get consent options and state. */
export async function getConsents(): Promise<ConsentOption[]> {
  try {
    return await apiGet<ConsentOption[]>(`${PREFIX}/privacy/consents`)
  } catch {
    return []
  }
}

/** Update consent. */
export async function updateConsent(
  id: string,
  enabled: boolean
): Promise<void> {
  await apiPatch(`${PREFIX}/privacy/consents/${id}`, { enabled })
}
