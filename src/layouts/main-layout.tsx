import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import {
  Menu,
  Search,
  LogIn,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navLinks = [
  { to: '/catalog', label: 'Browse' },
  { to: '/catalog-/-browse-listings', label: 'Browse Listings' },
  { to: '/create-/-edit-listing', label: 'Create listing' },
  { to: '/', label: 'How it works' },
  { to: '/help', label: 'Help' },
]

export function MainLayout() {
  const { isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl text-primary">Marketplace</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/catalog">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-1" />
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="text-sm font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        className="text-sm font-medium text-left"
                        onClick={() => {
                          logout()
                          setMobileOpen(false)
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-sm font-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/signup"
                        className="text-sm font-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-[1200px] px-4 py-8 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="font-semibold text-foreground">Marketplace</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Configurable two-sided marketplace engine.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Product</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li><Link to="/catalog">Browse</Link></li>
                <li><Link to="/login-signup">Log in / Sign up</Link></li>
                <li><Link to="/help">Help</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Staff</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li><Link to="/login?role=moderator">Moderator login</Link></li>
                <li><Link to="/login?role=admin">Admin login</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Legal</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li><Link to="/legal/privacy">Privacy</Link></li>
                <li><Link to="/legal/terms">Terms</Link></li>
                <li><Link to="/legal/cookies">Cookies</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Contact</p>
              <p className="mt-2 text-sm text-muted-foreground">
                support@marketplace.example
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
