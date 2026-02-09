import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  FolderKanban,
  ChevronLeft,
  Menu,
  Shield,
  MessageSquare,
  FileText,
  ClipboardList,
  AlertCircle,
  Scale,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

const SIDEBAR_STORAGE_KEY = 'marketplace_sidebar_collapsed'

const mainNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/projects', label: 'Listings', icon: FolderKanban },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/orders', label: 'Orders', icon: FileText },
  { to: '/dashboard/order-booking-history', label: 'Order / Booking History', icon: ClipboardList },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNav = [
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/moderation', label: 'Moderation', icon: AlertCircle },
  { to: '/dashboard/disputes', label: 'Disputes & Refunds', icon: Scale },
  { to: '/dashboard/admin', label: 'Admin', icon: Shield },
]

export function DashboardLayout() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const persistCollapsed = (value: boolean) => {
    setCollapsed(value)
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value))
    } catch {
      //
    }
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator'

  const NavLinks = ({ list, className }: { list: typeof mainNav; className?: string }) => (
    <nav className={cn('flex flex-col gap-1', className)}>
      {list.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        )
      })}
    </nav>
  )

  const sidebarContent = (
    <>
      <div className={cn('flex h-14 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'px-4')}>
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold min-w-0">
          <span className={cn('text-primary truncate', collapsed && 'text-lg')}>
            {collapsed ? 'M' : 'Marketplace'}
          </span>
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0"
            onClick={() => persistCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <NavLinks list={mainNav} />
        {isAdmin && (
          <>
            <Separator className="my-4" />
            <p className={cn('mb-2 px-3 text-xs font-semibold text-muted-foreground', collapsed && 'hidden')}>
              Admin
            </p>
            <NavLinks list={adminNav} />
          </>
        )}
      </ScrollArea>
      <div className={cn('border-t border-border p-2', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => persistCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        ) : (
          <Link to="/" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            Back to site
          </Link>
        )}
      </div>
    </>
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card transition-[width] duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="container mx-auto max-w-[1200px] p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
