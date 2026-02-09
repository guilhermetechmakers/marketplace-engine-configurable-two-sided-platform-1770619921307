import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NotificationPreferences } from '@/types'
import {
  getProfileSettings,
  updateProfileSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  getSavedCards,
  addCard,
  removeCard,
  setDefaultCard,
  getSavedBankAccounts,
  addBankAccount,
  removeBankAccount,
  changePassword,
  getSessions,
  revokeSession,
  requestDataExport,
  requestAccountDeletion,
  getConsents,
  updateConsent,
} from '@/api/settings-preferences'

const queryKeys = {
  profile: () => ['settings', 'profile'] as const,
  notifications: () => ['settings', 'notifications'] as const,
  cards: () => ['settings', 'payment-methods', 'cards'] as const,
  banks: () => ['settings', 'payment-methods', 'banks'] as const,
  sessions: () => ['settings', 'sessions'] as const,
  consents: () => ['settings', 'consents'] as const,
}

export function useProfileSettings() {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: getProfileSettings,
  })
}

export function useUpdateProfileSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateProfileSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile() }),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: getNotificationPreferences,
  })
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prefs: NotificationPreferences[]) =>
      updateNotificationPreferences(prefs),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications() }),
  })
}

export function useSavedCards() {
  return useQuery({
    queryKey: queryKeys.cards(),
    queryFn: getSavedCards,
  })
}

export function useAddCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cards() }),
  })
}

export function useRemoveCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cards() }),
  })
}

export function useSetDefaultCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: setDefaultCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cards() }),
  })
}

export function useSavedBankAccounts() {
  return useQuery({
    queryKey: queryKeys.banks(),
    queryFn: getSavedBankAccounts,
  })
}

export function useAddBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addBankAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.banks() }),
  })
}

export function useRemoveBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeBankAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.banks() }),
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword })
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions(),
    queryFn: getSessions,
  })
}

export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sessions() }),
  })
}

export function useRequestDataExport() {
  return useMutation({ mutationFn: requestDataExport })
}

export function useRequestAccountDeletion() {
  return useMutation({ mutationFn: requestAccountDeletion })
}

export function useConsents() {
  return useQuery({
    queryKey: queryKeys.consents(),
    queryFn: getConsents,
  })
}

export function useUpdateConsent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateConsent(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.consents() }),
  })
}
