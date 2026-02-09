import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useProfileSettings, useUpdateProfileSettings } from '@/hooks/use-settings-preferences'
import { toast } from 'sonner'
import { User, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const profileSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(500).optional(),
  location: z.string().max(120).optional(),
  language: z.string().min(1, 'Language is required'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
]

export function ProfileSettings() {
  const { user } = useAuth()
  const { data: profile, isLoading, isError } = useProfileSettings()
  const updateMutation = useUpdateProfileSettings()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    defaultValues: {
      displayName: user?.displayName ?? '',
      bio: '',
      location: '',
      language: 'en',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || user?.displayName || '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        language: profile.language ?? 'en',
      })
    } else if (!isLoading && user) {
      form.reset({
        displayName: user.displayName ?? '',
        bio: '',
        location: '',
        language: 'en',
      })
    }
  }, [profile, user, isLoading, form])

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => toast.success('Profile updated'),
      onError: () => toast.error('Failed to update profile'),
    })
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="rounded-2xl border border-border">
        <CardContent className="p-6">
          <p className="text-sm text-destructive">
            Failed to load profile. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>Update your name, bio, location, and language</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              placeholder="Your name"
              {...form.register('displayName')}
              className="transition-colors duration-200 focus:border-primary"
            />
            {form.formState.errors.displayName && (
              <p className="text-sm text-destructive animate-fade-in">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              placeholder="Short bio (optional)"
              {...form.register('bio')}
              className="transition-colors duration-200 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City or region (optional)"
              {...form.register('location')}
              className="transition-colors duration-200 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              {...form.register('language')}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {form.formState.errors.language && (
              <p className="text-sm text-destructive animate-fade-in">
                {form.formState.errors.language.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-pulse" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
