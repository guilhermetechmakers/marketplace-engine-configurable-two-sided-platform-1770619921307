import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useBrandLogo,
  useUpdateBrandLogo,
  useDeleteBrandLogo,
  useUploadBrandLogo,
} from '@/hooks/use-brand-logo'
import { toast } from 'sonner'
import {
  ImageIcon,
  Upload,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const altSchema = z.object({
  altText: z.string().max(120).optional(),
})

const urlSchema = z.object({
  imageUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type AltFormValues = z.infer<typeof altSchema>
type UrlFormValues = z.infer<typeof urlSchema>

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function DashboardBrandLogo() {
  const { data: logo, isLoading, isError, refetch } = useBrandLogo()
  const updateMutation = useUpdateBrandLogo()
  const deleteMutation = useDeleteBrandLogo()
  const uploadMutation = useUploadBrandLogo()

  const [dragActive, setDragActive] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)

  const altForm = useForm<AltFormValues>({
    resolver: zodResolver(altSchema) as Resolver<AltFormValues>,
    defaultValues: { altText: '' },
  })

  const urlForm = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema) as Resolver<UrlFormValues>,
    defaultValues: { imageUrl: '' },
  })

  useEffect(() => {
    if (logo) {
      altForm.reset({ altText: logo.altText ?? '' })
    }
  }, [logo, altForm])

  const handleSaveAlt = useCallback(
    (values: AltFormValues) => {
      if (!logo?.url) return
      updateMutation.mutate(
        { url: logo.url, altText: values.altText },
        {
          onSuccess: () => toast.success('Logo details updated'),
          onError: () => toast.error('Failed to update'),
        }
      )
    },
    [logo, updateMutation]
  )

  const handleRemove = useCallback(() => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => toast.success('Brand logo removed'),
      onError: () => toast.error('Failed to remove logo'),
    })
  }, [deleteMutation])

  const setLogoFromUrl = useCallback(
    (url: string) => {
      if (!url.trim()) return
      updateMutation.mutate(
        { url: url.trim(), altText: altForm.getValues('altText') },
        {
          onSuccess: () => {
            toast.success('Brand logo updated')
            setShowUrlInput(false)
            urlForm.reset({ imageUrl: '' })
          },
          onError: () => toast.error('Failed to save logo'),
        }
      )
    },
    [updateMutation, altForm, urlForm]
  )

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please choose an image file (e.g. PNG, JPG, SVG)')
        return
      }
      try {
        const { url } = await uploadMutation.mutateAsync(file)
        updateMutation.mutate(
          { url, altText: altForm.getValues('altText') },
          {
            onSuccess: () => toast.success('Brand logo updated'),
            onError: () => toast.error('Failed to save logo'),
          }
        )
      } catch {
        const dataUrl = await readFileAsDataUrl(file)
        updateMutation.mutate(
          { url: dataUrl, altText: altForm.getValues('altText') },
          {
            onSuccess: () => toast.success('Brand logo updated'),
            onError: () => toast.error('Failed to save logo'),
          }
        )
      }
    },
    [uploadMutation, updateMutation, altForm]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onUrlSubmit = (values: UrlFormValues) => {
    if (values.imageUrl) setLogoFromUrl(values.imageUrl)
  }

  const isBusy =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    uploadMutation.isPending

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card className="overflow-hidden rounded-2xl border border-border shadow-card">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Brand Logo</span>
        </nav>
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground">
                Failed to load brand logo
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Something went wrong. Please try again.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => refetch()}
              className="gap-2"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasLogo = Boolean(logo?.url)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <nav
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link
          to="/dashboard"
          className="hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="text-foreground">Brand Logo</span>
      </nav>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Brand Logo
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload or set your platform logo for the header and sidebar.
        </p>
      </header>

      <Card className="overflow-hidden rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ImageIcon className="h-5 w-5 text-primary" />
            Logo
          </CardTitle>
          <CardDescription>
            Use a square or wide image. Recommended: at least 120×40px, PNG or
            SVG.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasLogo ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div
                  className={cn(
                    'flex h-24 min-w-[160px] items-center justify-center rounded-xl border border-border bg-muted/30 p-3 transition-all duration-200 hover:shadow-md'
                  )}
                >
                  <img
                    src={logo!.url}
                    alt={logo!.altText ?? 'Brand logo'}
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <form
                    onSubmit={altForm.handleSubmit(handleSaveAlt)}
                    className="space-y-2"
                  >
                    <Label htmlFor="altText">Alt text (accessibility)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="altText"
                        placeholder="e.g. Marketplace"
                        {...altForm.register('altText')}
                        className={cn(
                          altForm.formState.errors.altText &&
                            'border-destructive focus-visible:ring-destructive'
                        )}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isBusy || !altForm.formState.isDirty}
                        className="gap-2"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-pulse" />
                        ) : null}
                        Save
                      </Button>
                    </div>
                    {altForm.formState.errors.altText && (
                      <p className="text-sm text-destructive">
                        {altForm.formState.errors.altText.message}
                      </p>
                    )}
                  </form>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUrlInput((v) => !v)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Change logo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemove}
                      disabled={isBusy}
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              {showUrlInput && (
                <form
                  onSubmit={urlForm.handleSubmit(onUrlSubmit)}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="imageUrl">Or enter image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      {...urlForm.register('imageUrl')}
                    />
                    {urlForm.formState.errors.imageUrl && (
                      <p className="text-sm text-destructive">
                        {urlForm.formState.errors.imageUrl.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isBusy || !urlForm.watch('imageUrl')?.trim()}
                    className="gap-2 sm:shrink-0"
                  >
                    Update from URL
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              <div
                onDrop={onDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                }}
                className={cn(
                  'flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors',
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30 hover:bg-muted/50'
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  id="brand-logo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = ''
                  }}
                />
                <label
                  htmlFor="brand-logo-upload"
                  className="flex cursor-pointer flex-col items-center gap-2 text-center"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    Drop an image here or click to browse
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, or SVG. Max 2MB recommended.
                  </span>
                </label>
              </div>

              {!showUrlInput ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUrlInput(true)}
                  className="gap-2"
                >
                  Or enter image URL
                </Button>
              ) : (
                <form
                  onSubmit={urlForm.handleSubmit(onUrlSubmit)}
                  className="space-y-2 rounded-xl border border-border bg-muted/20 p-4"
                >
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      {...urlForm.register('imageUrl')}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isBusy || !urlForm.watch('imageUrl')?.trim()}
                        className="gap-2"
                      >
                        Save logo
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowUrlInput(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  {urlForm.formState.errors.imageUrl && (
                    <p className="text-sm text-destructive">
                      {urlForm.formState.errors.imageUrl.message}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild className="gap-2">
          <Link to="/dashboard/settings">Back to Settings</Link>
        </Button>
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/dashboard">Dashboard overview</Link>
        </Button>
      </div>
    </div>
  )
}
