import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Sliders } from 'lucide-react'

export function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-[1200px] grid gap-8 md:grid-cols-2 md:gap-12 md:items-center">
          <div className="space-y-6 animate-in">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Launch your marketplace in{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                weeks, not months
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              A configurable two-sided platform engine. Define your categories, fees, and workflows—we handle listings, payments, and trust & safety.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="lg" variant="secondary">
                  Browse catalog
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-square max-w-md rounded-2xl border border-border bg-card shadow-card p-8 flex items-center justify-center">
              <Sliders className="h-32 w-32 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid - bento style */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-[1200px]">
          <h2 className="text-2xl font-semibold text-center mb-12">Why build on the engine</h2>
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Configuration-first</h3>
              <p className="text-muted-foreground">
                Category schemas, fee rules, and feature flags drive UI and workflows. No code changes for new niches.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
              <Shield className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-xl font-medium mb-2">Trust & safety</h3>
              <p className="text-muted-foreground">
                Moderation queue, disputes, KYC, and Stripe Connect built in.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
              <Sliders className="h-10 w-10 text-accent mb-4" />
              <h3 className="text-xl font-medium mb-2">Multi-mode transactions</h3>
              <p className="text-muted-foreground">
                Checkout, booking, and inquiry/quote from one engine.
              </p>
            </div>
            <div className="md:col-span-2 rounded-2xl border border-border bg-primary/5 p-6">
              <h3 className="text-xl font-medium mb-4">Use case templates</h3>
              <p className="text-muted-foreground mb-4">
                Start from rental, services, or goods—then customize.
              </p>
              <Link to="/signup">
                <Button variant="secondary">Explore templates</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-[1200px]">
          <h2 className="text-2xl font-semibold text-center mb-12">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: 1, title: 'Configure', desc: 'Define categories, listing schema, and fees in the admin.' },
              { step: 2, title: 'Onboard', desc: 'Sellers complete KYC and Stripe Connect; buyers sign up.' },
              { step: 3, title: 'Launch', desc: 'Listings go live; payments and payouts run automatically.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {step}
                </div>
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to launch?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join founders and operators who ship marketplaces in under 4 weeks.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
