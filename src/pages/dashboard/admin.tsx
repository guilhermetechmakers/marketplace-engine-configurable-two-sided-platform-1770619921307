import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sliders, Flag, DollarSign } from 'lucide-react'

export function DashboardAdmin() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">Platform configuration and operations</p>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="config" className="gap-2">
            <Sliders className="h-4 w-4" />
            Config
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">Categories</TabsTrigger>
          <TabsTrigger value="disputes" className="gap-2">
            <Flag className="h-4 w-4" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Payouts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature flags</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Enable or disable features across the marketplace.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fee rules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Commission and fixed fees per category.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category schemas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Edit category taxonomy and listing schema (JSONB).</p>
              <Button variant="secondary" className="mt-4">Edit schema</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="disputes">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Flag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No open disputes.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payouts">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Payout schedule and manual adjustments.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
