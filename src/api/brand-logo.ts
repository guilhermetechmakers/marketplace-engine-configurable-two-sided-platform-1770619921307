import type { BrandLogo } from '@/types'
import { apiGet, apiPut, apiDelete, apiPostForm } from '@/lib/api'

const PREFIX = '/brand/logo'

/** Fetch current platform brand logo. */
export async function getBrandLogo(): Promise<BrandLogo | null> {
  try {
    return await apiGet<BrandLogo>(PREFIX)
  } catch {
    return null
  }
}

/** Update brand logo (url and optional alt text). */
export async function updateBrandLogo(data: {
  url: string
  altText?: string
}): Promise<BrandLogo> {
  return apiPut<BrandLogo>(PREFIX, data)
}

/** Remove brand logo. */
export async function deleteBrandLogo(): Promise<void> {
  await apiDelete(`${PREFIX}`)
}

/** Upload logo file; returns object with url for use in updateBrandLogo. */
export async function uploadBrandLogoFile(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostForm<{ url: string }>(`${PREFIX}/upload`, formData)
}
