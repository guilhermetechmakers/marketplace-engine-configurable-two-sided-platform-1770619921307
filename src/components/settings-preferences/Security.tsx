import { useState } from 'react'
import type { UserSession } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP } from '@/components/ui/input-otp'
import { useAuth } from '@/contexts/auth-context'
import { setup2FA, enable2FA, disable2FA } from '@/api/auth'
import {
  useChangePassword,
  useSessions,
  useRevokeSession,
} from '@/hooks/use-settings-preferences'
import { toast } from 'sonner'
import { Shield, Key, ShieldCheck, Monitor, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type TwoFactorStep = 'idle' | 'setup' | 'verifying'

export function Security() {
  const { user } = useAuth()
  const [twoFactorStep, setTwoFactorStep] = useState<TwoFactorStep>('idle')
  const [setupSecret, setSetupSecret] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled ?? false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const changePasswordMutation = useChangePassword()
  const { data: sessions, isLoading: sessionsLoading } = useSessions()
  const revokeSessionMutation = useRevokeSession()

  const handleEnable2FA = async () => {
    setIs2FALoading(true)
    try {
      const { secret, qrCodeUrl: url } = await setup2FA()
      setSetupSecret(secret)
      setQrCodeUrl(url)
      setTwoFactorStep('setup')
    } catch {
      toast.error('Failed to start 2FA setup')
    } finally {
      setIs2FALoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!setupSecret || otpValue.length !== 6) {
      setOtpError(true)
      return
    }
    setIs2FALoading(true)
    setOtpError(false)
    try {
      await enable2FA(setupSecret, otpValue)
      setIs2FAEnabled(true)
      setTwoFactorStep('idle')
      setSetupSecret(null)
      setQrCodeUrl(null)
      setOtpValue('')
      toast.success('Two-factor authentication enabled')
    } catch {
      setOtpError(true)
      toast.error('Invalid verification code')
    } finally {
      setIs2FALoading(false)
    }
  }

  const handleCancel2FASetup = () => {
    setTwoFactorStep('idle')
    setSetupSecret(null)
    setQrCodeUrl(null)
    setOtpValue('')
    setOtpError(false)
  }

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error('Enter your password to disable 2FA')
      return
    }
    try {
      await disable2FA(disablePassword)
      setIs2FAEnabled(false)
      setDisablePassword('')
      toast.success('Two-factor authentication disabled')
    } catch {
      toast.error('Failed to disable 2FA. Check your password.')
    }
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated')
          setShowChangePassword(false)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
        onError: () => toast.error('Failed to change password'),
      }
    )
  }

  return (
    <Card className="rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-5 w-5 text-primary" />
          Security
        </CardTitle>
        <CardDescription>
          Change password, enable/disable 2FA (TOTP), and manage sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h4 className="mb-3 flex items-center gap-2 font-medium">
            <Key className="h-4 w-4 text-muted-foreground" />
            Password
          </h4>
          {!showChangePassword ? (
            <Button
              variant="secondary"
              className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setShowChangePassword(true)}
            >
              Change password
            </Button>
          ) : (
            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="transition-colors duration-200 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="transition-colors duration-200 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="transition-colors duration-200 focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    changePasswordMutation.isPending ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-pulse" />
                  ) : (
                    'Update password'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowChangePassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>

        <section>
          <h4 className="mb-3 flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Two-factor authentication (TOTP)
          </h4>
          {is2FAEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/5 p-4">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-medium">Two-factor authentication enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with TOTP.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="Enter password to disable 2FA"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={handleDisable2FA}
                  disabled={!disablePassword}
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          ) : twoFactorStep === 'setup' ? (
            <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) or enter the secret manually.
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    className="h-40 w-40 rounded-lg border bg-white p-2"
                  />
                </div>
              )}
              {setupSecret && (
                <p className="text-center text-xs font-mono text-muted-foreground">
                  Secret: {setupSecret}
                </p>
              )}
              <div className="space-y-2">
                <Label>Enter verification code</Label>
                <InputOTP
                  value={otpValue}
                  onChange={(v) => {
                    setOtpValue(v)
                    setOtpError(false)
                  }}
                  error={otpError}
                  disabled={is2FALoading}
                />
                {otpError && (
                  <p className="text-sm text-destructive animate-fade-in">
                    Invalid code. Please try again.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyAndEnable}
                  disabled={is2FALoading || otpValue.length !== 6}
                >
                  {is2FALoading ? 'Verifying…' : 'Enable 2FA'}
                </Button>
                <Button variant="outline" onClick={handleCancel2FASetup} disabled={is2FALoading}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleEnable2FA}
              disabled={is2FALoading}
            >
              {is2FALoading ? 'Setting up…' : 'Enable 2FA'}
            </Button>
          )}
        </section>

        <section>
          <h4 className="mb-3 flex items-center gap-2 font-medium">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            Session management
          </h4>
          {sessionsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : !sessions?.length ? (
            <p className="text-sm text-muted-foreground">No other sessions found.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((session: UserSession) => (
                <li
                  key={session.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border border-border p-4 transition-all duration-200',
                    'hover:border-primary/30 hover:shadow-card'
                  )}
                >
                  <div>
                    <p className="font-medium">
                      {session.device ?? 'Unknown device'}
                      {session.current && (
                        <span className="ml-2 text-xs text-primary">Current</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={revokeSessionMutation.isPending}
                      onClick={() =>
                        revokeSessionMutation.mutate(session.id, {
                          onSuccess: () => toast.success('Session revoked'),
                        })
                      }
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
