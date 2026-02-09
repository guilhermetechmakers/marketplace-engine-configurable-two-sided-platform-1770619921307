import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

export function ListingForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', price: 0 },
  })

  const onSubmit = (_data: FormData) => {
    toast.success(isEdit ? 'Listing updated' : 'Listing created')
    navigate('/dashboard/projects')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in py-8">
      <Link to="/dashboard/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to listings
      </Link>
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit listing' : 'New listing'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Listing title" {...register('title')} className={cn(errors.title && 'border-destructive')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Describe your offering" {...register('description')} className={cn(errors.description && 'border-destructive')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} className={cn(errors.price && 'border-destructive')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit">{isEdit ? 'Save changes' : 'Create listing'}</Button>
          <Link to="/dashboard/projects"><Button type="button" variant="secondary">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}
