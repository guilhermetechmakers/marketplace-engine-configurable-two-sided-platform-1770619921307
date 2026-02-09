import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBrandLogo,
  updateBrandLogo,
  deleteBrandLogo,
  uploadBrandLogoFile,
} from '@/api/brand-logo'

const queryKey = ['brand', 'logo'] as const

export function useBrandLogo() {
  return useQuery({
    queryKey,
    queryFn: getBrandLogo,
  })
}

export function useUpdateBrandLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { url: string; altText?: string }) =>
      updateBrandLogo(data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

export function useDeleteBrandLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBrandLogo,
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

export function useUploadBrandLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadBrandLogoFile(file),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}
