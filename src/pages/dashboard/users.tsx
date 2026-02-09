import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users as UsersIcon } from 'lucide-react'

export function DashboardUsers() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground">Manage platform users (admin)</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All users</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">User management table will load here.</p>
            <Button variant="secondary" className="mt-4">Load users</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
