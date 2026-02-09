import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ProfileSettings,
  Notifications,
  PaymentMethods,
  Security,
  Privacy,
} from '@/components/settings-preferences'
import { User, Bell, CreditCard, Shield, ShieldAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function PreferencesPageContent() {
  return (
    <div className="space-y-6 animate-in">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Preferences
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, notifications, payment methods, security, and privacy.
        </p>
      </header>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger
            value="profile"
            className="gap-2 transition-all duration-200 data-[state=active]:shadow-card"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 transition-all duration-200 data-[state=active]:shadow-card"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="gap-2 transition-all duration-200 data-[state=active]:shadow-card"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2 transition-all duration-200 data-[state=active]:shadow-card"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="gap-2 transition-all duration-200 data-[state=active]:shadow-card"
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <Notifications />
        </TabsContent>
        <TabsContent value="payment" className="mt-6">
          <PaymentMethods />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <Security />
        </TabsContent>
        <TabsContent value="privacy" className="mt-6">
          <Privacy />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function PreferencesPage() {
  useEffect(() => {
    document.title = 'Preferences — Marketplace'
    return () => {
      document.title = 'Marketplace'
    }
  }, [])
  return <PreferencesPageContent />
}

export function PreferencesPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-12 w-full max-w-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
