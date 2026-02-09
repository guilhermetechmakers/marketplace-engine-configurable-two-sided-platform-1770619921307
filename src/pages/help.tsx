import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, BookOpen, Mail } from 'lucide-react'

const ARTICLES = [
  { id: '1', title: 'Getting started as a buyer', category: 'Buyers' },
  { id: '2', title: 'Seller onboarding', category: 'Sellers' },
  { id: '3', title: 'Payments and payouts', category: 'Payments' },
  { id: '4', title: 'Cancellation and refunds', category: 'Policies' },
]

export function Help() {
  const [query, setQuery] = useState('')

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in py-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Help Center</h1>
        <p className="text-muted-foreground">Search articles and guides</p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ARTICLES.map((article) => (
          <Card key={article.id} className="transition-shadow hover:shadow-card-hover cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{article.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Can&apos;t find what you need? Send us a message.</p>
          <Button>Contact us</Button>
        </CardContent>
      </Card>
    </div>
  )
}
