import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputOTP } from '@/components/ui/input-otp'
import { useAuth } from '@/contexts/auth-context'
import { setup2FA, enable2FA } from '@/api/auth'
import { toast } from 'sonner'
import { User, Bell, Shield, ShieldCheck, Key } from 'lucide-react'

type TwoFactorStep = 'idle' | 'setup' | 'verifying'

export function DashboardSettings() {
  const { user } = useAuth()
  const [twoFactorStep, setTwoFactorStep] = useState<TwoFactorStep>('idle')
  const [setupSecret, setSetupSecret] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled ?? false)

  const handleEnable2FA = async () => {
    setIsLoading(true)
    try {
      const { secret, qrCodeUrl: url } = await setup2FA()
      setSetupSecret(secret)
      setQrCodeUrl(url)
      setTwoFactorStep('setup')
    } catch {
      toast.error('Failed to start 2FA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!setupSecret || otpValue.length !== 6) {
      setOtpError(true)
      return
    }
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const handleCancel2FASetup = () => {
    setTwoFactorStep('idle')
    setSetupSecret(null)
    setQrCodeUrl(null)
    setOtpValue('')
    setOtpError(false)
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your display name and email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  defaultValue={user?.displayName ?? ''}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email ?? ''}
                  disabled
                  className="opacity-80"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>
              <Button onClick={() => toast.success('Profile updated')}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you receive updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notification preferences will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Password and two-factor authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button variant="secondary">Change password</Button>

              {is2FAEnabled ? (
                <div className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/5 p-4">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Two-factor authentication enabled</p>
                    <p className="text-sm text-muted-foreground">Your account is protected with TOTP.</p>
                  </div>
                </div>
              ) : twoFactorStep === 'setup' ? (
                <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <p className="font-medium">Set up authenticator app</p>
                  </div>
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
                      onChange={(v) => { setOtpValue(v); setOtpError(false) }}
                      error={otpError}
                      disabled={isLoading}
                    />
                    {otpError && (
                      <p className="text-sm text-destructive">Invalid code. Please try again.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleVerifyAndEnable} disabled={isLoading || otpValue.length !== 6}>
                      {isLoading ? 'Verifying...' : 'Enable 2FA'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel2FASetup} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleEnable2FA}
                  disabled={isLoading}
                >
                  {isLoading ? 'Setting up...' : 'Enable 2FA'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
