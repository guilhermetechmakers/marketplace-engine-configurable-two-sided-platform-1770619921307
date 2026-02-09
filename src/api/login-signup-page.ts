import type { LoginSignupPage } from '@/types'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'

/** API base path; backend typically maps to login_signup_page table. */
const BASE = '/login-signup-page'

export async function getLoginSignupPages(): Promise<LoginSignupPage[]> {
  try {
    return await apiGet<LoginSignupPage[]>(BASE)
  } catch {
    return []
  }
}

export async function getLoginSignupPage(id: string): Promise<LoginSignupPage | null> {
  try {
    return await apiGet<LoginSignupPage>(`${BASE}/${id}`)
  } catch {
    return null
  }
}

export async function createLoginSignupPage(
  data: Omit<LoginSignupPage, 'id' | 'created_at' | 'updated_at'>
): Promise<LoginSignupPage> {
  return apiPost<LoginSignupPage>(BASE, data)
}

export async function updateLoginSignupPage(
  id: string,
  data: Partial<Pick<LoginSignupPage, 'title' | 'description' | 'status'>>
): Promise<LoginSignupPage> {
  return apiPatch<LoginSignupPage>(`${BASE}/${id}`, data)
}

export async function deleteLoginSignupPage(id: string): Promise<void> {
  await apiDelete(`${BASE}/${id}`)
}
