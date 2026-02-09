import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const LEGAL_PAGES: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: 'Last updated: 2024. We collect information you provide (email, profile, transactions) and use it to operate the marketplace, process payments, and send notifications. We do not sell your data. You can request access or deletion by contacting support.',
  },
  terms: {
    title: 'Terms of Service',
    content: 'By using this marketplace you agree to these terms. You must be 18+ to transact. Sellers are responsible for their listings and compliance with laws. The platform may suspend accounts for violations. Disputes are subject to our dispute resolution process.',
  },
  cookies: {
    title: 'Cookie Policy',
    content: 'We use essential cookies for authentication and session management, and optional analytics cookies to improve the product. You can manage preferences in Settings.',
  },
}

export function Legal() {
  const { slug } = useParams<{ slug: string }>()
  const page = slug ? LEGAL_PAGES[slug] : null

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <p className="text-muted-foreground">Legal page not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{page.title}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">{page.content}</p>
        </CardContent>
      </Card>
    </div>
  )
}
