import { reportError } from '@/lib/sentry'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export type ApiError = {
  message: string
  code?: string
  status?: number
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  // When auth is implemented, read token from httpOnly cookie or storage
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = await getAuthHeaders()
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err: ApiError = {
      message: (data as { message?: string }).message ?? res.statusText,
      code: (data as { code?: string }).code,
      status: res.status,
    }
    reportError(err, { path, status: res.status, method: options.method ?? 'GET' })
    throw err
  }
  return data as T
}

export const apiGet = <T>(path: string) => api<T>(path, { method: 'GET' })
export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
export const apiPut = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
export const apiPatch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
export const apiDelete = <T>(path: string) => api<T>(path, { method: 'DELETE' })

/** POST with FormData (e.g. file upload). Omits Content-Type so browser sets multipart boundary. */
export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers: HeadersInit = {}
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err: ApiError = {
      message: (data as { message?: string }).message ?? res.statusText,
      code: (data as { code?: string }).code,
      status: res.status,
    }
    reportError(err, { path, status: res.status, method: 'POST', type: 'form' })
    throw err
  }
  return data as T
}
