import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ConsentOption } from '@/api/settings-preferences'
import {
  useRequestDataExport,
  useRequestAccountDeletion,
  useConsents,
  useUpdateConsent,
} from '@/hooks/use-settings-preferences'
import { toast } from 'sonner'
import { ShieldAlert, Download, Trash2, FileCheck, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function Privacy() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const exportMutation = useRequestDataExport()
  const deleteMutation = useRequestAccountDeletion()
  const { data: consents, isLoading: consentsLoading } = useConsents()
  const updateConsentMutation = useUpdateConsent()

  const handleDataExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(
          'Data export requested. You will receive an email when it is ready.'
        )
      },
      onError: () => toast.error('Failed to request data export'),
    })
  }

  const handleAccountDeletion = () => {
    if (deleteConfirmation !== 'DELETE' || !deletePassword) {
      toast.error('Type DELETE and enter your password to confirm.')
      return
    }
    deleteMutation.mutate(
      { password: deletePassword, confirmation: deleteConfirmation },
      {
        onSuccess: () => {
          toast.success('Account deletion requested. Check your email.')
          setDeleteDialogOpen(false)
          setDeletePassword('')
          setDeleteConfirmation('')
        },
        onError: () => toast.error('Failed to request account deletion'),
      }
    )
  }

  return (
    <>
      <Card className="rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Privacy
          </CardTitle>
          <CardDescription>
            Data export, account deletion, and consent management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <Download className="h-4 w-4 text-muted-foreground" />
              Data export request
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Request a copy of your personal data. We will prepare a download link and send it to your email.
            </p>
            <Button
              variant="secondary"
              className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleDataExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-pulse" />
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Request data export
                </>
              )}
            </Button>
          </section>

          <section>
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              Account deletion
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Permanently delete your account and associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Request account deletion
            </Button>
          </section>

          <section>
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              Consent management
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Control how we use your data for marketing and analytics.
            </p>
            {consentsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : !consents?.length ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                <FileCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No consent options to display. Preferences are managed elsewhere.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {consents.map((c: ConsentOption) => (
                  <li
                    key={c.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border border-border p-4 transition-all duration-200',
                      'hover:border-primary/30 hover:shadow-card'
                    )}
                  >
                    <div>
                      <p className="font-medium">{c.label}</p>
                      {c.description && (
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      )}
                    </div>
                    <Switch
                      checked={c.enabled}
                      onCheckedChange={(checked) =>
                        updateConsentMutation.mutate(
                          { id: c.id, enabled: checked },
                          {
                            onSuccess: () =>
                              toast.success('Consent updated'),
                          }
                        )
                      }
                      disabled={updateConsentMutation.isPending}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated data. Type DELETE below and enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">Type DELETE to confirm</Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Your password</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleAccountDeletion}
              disabled={
                deleteMutation.isPending ||
                deleteConfirmation !== 'DELETE' ||
                !deletePassword
              }
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-pulse" />
              ) : (
                'Delete account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
