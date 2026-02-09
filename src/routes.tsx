import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { MainLayout } from '@/layouts/main-layout'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { useAuth } from '@/contexts/auth-context'
import { Landing } from '@/pages/landing'
import { Catalog } from '@/pages/catalog'
import { ListingDetail } from '@/pages/listing-detail'
import { Login } from '@/pages/login'
import { Signup } from '@/pages/signup'
import SignupPage from '@/pages/Login/SignupPage'
import { VerifyEmail } from '@/pages/verify-email'
import { ForgotPassword } from '@/pages/forgot-password'
import { Checkout } from '@/pages/checkout'
import { Onboarding } from '@/pages/onboarding'
import { Help } from '@/pages/help'
import { Legal } from '@/pages/legal'
import { NotFound } from '@/pages/not-found'
import { ErrorPage } from '@/pages/error-page'
import { ListingForm } from '@/pages/listing-form'
import { DashboardOverview } from '@/pages/dashboard/overview'
import { DashboardAnalytics } from '@/pages/dashboard/analytics'
import { DashboardSettings } from '@/pages/dashboard/settings'
import { DashboardProjects } from '@/pages/dashboard/projects'
import { DashboardMessages } from '@/pages/dashboard/messages'
import { DashboardOrders } from '@/pages/dashboard/orders'
import { DashboardUsers } from '@/pages/dashboard/users'
import { DashboardModeration } from '@/pages/dashboard/moderation'
import { DashboardAdmin } from '@/pages/dashboard/admin'
import { DashboardDisputes } from '@/pages/dashboard/disputes'
import { DashboardOrderDetail } from '@/pages/dashboard/order-detail'
import BookingHistory from '@/pages/Order/BookingHistory'
import BrowseListings from '@/pages/Catalog/BrowseListings'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-pulse rounded-full bg-muted" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const mainRoutes = {
  element: <MainLayout />,
  children: [
    { index: true, element: <Landing /> },
    { path: 'catalog', element: <Catalog /> },
    { path: 'catalog-/-browse-listings', element: <BrowseListings /> },
    { path: 'listing/:id', element: <ListingDetail /> },
    { path: 'listing/new', element: <RequireAuth><ListingForm /></RequireAuth> },
    { path: 'listing/:id/edit', element: <RequireAuth><ListingForm /></RequireAuth> },
    { path: 'login', element: <Login /> },
    { path: 'login/moderator', element: <Navigate to="/login?role=moderator" replace /> },
    { path: 'login/admin', element: <Navigate to="/login?role=admin" replace /> },
    { path: 'signup', element: <Signup /> },
    { path: 'login-signup', element: <SignupPage /> },
    { path: 'login-/-signup-page', element: <Navigate to="/login-signup" replace /> },
    { path: 'order-/-booking-history', element: <Navigate to="/dashboard/order-booking-history" replace /> },
    { path: 'verify-email', element: <VerifyEmail /> },
    { path: 'forgot-password', element: <ForgotPassword /> },
    { path: 'checkout/:id', element: <RequireAuth><Checkout /></RequireAuth> },
    { path: 'onboarding', element: <RequireAuth><Onboarding /></RequireAuth> },
    { path: 'help', element: <Help /> },
    { path: 'legal/:slug', element: <Legal /> },
    { path: '404', element: <NotFound /> },
    { path: '500', element: <ErrorPage /> },
    { path: '*', element: <NotFound /> },
  ],
}

const dashboardRoutes = {
  path: 'dashboard',
  element: <DashboardLayout />,
  children: [
    { index: true, element: <DashboardOverview /> },
    { path: 'overview', element: <DashboardOverview /> },
    { path: 'analytics', element: <DashboardAnalytics /> },
    { path: 'projects', element: <DashboardProjects /> },
    { path: 'messages', element: <DashboardMessages /> },
    { path: 'orders', element: <DashboardOrders /> },
    { path: 'orders/:id', element: <DashboardOrderDetail /> },
    { path: 'settings', element: <DashboardSettings /> },
    { path: 'users', element: <DashboardUsers /> },
    { path: 'moderation', element: <DashboardModeration /> },
    { path: 'admin', element: <DashboardAdmin /> },
    { path: 'disputes', element: <DashboardDisputes /> },
    { path: 'order-booking-history', element: <BookingHistory /> },
  ],
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      mainRoutes,
      dashboardRoutes,
    ],
  },
])
