import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CategorySelector,
  DynamicFormEngine,
  MediaUpload,
  PricingModule,
  AvailabilityCalendar,
  PreviewPublishControls,
} from '@/components/create-edit-listing'
import type { MediaItem } from '@/components/create-edit-listing'
import type { PricingData } from '@/components/create-edit-listing'
import type { AvailabilityData } from '@/components/create-edit-listing'
import { LISTING_FORM_SCHEMAS, getListingFormSchemaByCategoryId } from '@/config/create-edit-listing'
import {
  useCreateEditListingQuery,
  useCreateCreateEditListingMutation,
  useUpdateCreateEditListingMutation,
} from '@/hooks/use-create-edit-listing'

const defaultPricing: PricingData = {
  priceType: 'single',
  currency: 'USD',
  singlePrice: 0,
  taxInclusive: false,
  shippingEnabled: false,
  shippingAmount: 0,
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [categoryId, setCategoryId] = useState('')
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean | string[]>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [media, setMedia] = useState<MediaItem[]>([])
  const [pricing, setPricing] = useState<PricingData>(defaultPricing)
  const [availability, setAvailability] = useState<AvailabilityData>({})

  const schema = categoryId ? getListingFormSchemaByCategoryId(categoryId) : undefined

  const { data: existing, isLoading: loadingExisting } = useCreateEditListingQuery(id ?? '', isEdit)
  const createMutation = useCreateCreateEditListingMutation()
  const updateMutation = useUpdateCreateEditListingMutation()

  useEffect(() => {
    if (existing) {
      setCategoryId(existing.category_id ?? '')
      setFormValues((prev) => ({
        ...prev,
        title: existing.title,
        description: existing.description ?? '',
      }))
    }
  }, [existing])

  useEffect(() => {
    document.title = isEdit ? 'Edit listing | Marketplace' : 'Create listing | Marketplace'
  }, [isEdit])

  const updateFormValue = useCallback((key: string, value: string | number | boolean | string[]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: '' }))
  }, [formErrors])

  const validate = useCallback((): string[] => {
    const errors: string[] = []
    const title = formValues.title as string
    const description = formValues.description as string
    if (!title?.trim()) errors.push('Title is required.')
    if (!description?.trim()) errors.push('Description is required.')
    if (!categoryId) errors.push('Please select a category.')
    if (schema?.fields) {
      schema.fields.forEach((f) => {
        if (f.required) {
          const v = formValues[f.key]
          if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
            errors.push(`${f.label} is required.`)
          }
        }
      })
    }
    const fieldErrors: Record<string, string> = {}
    schema?.fields?.forEach((f) => {
      if (f.required) {
        const v = formValues[f.key]
        if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
          fieldErrors[f.key] = `${f.label} is required.`
        }
      }
    })
    setFormErrors(fieldErrors)
    return errors
  }, [formValues, categoryId, schema])

  const handleSaveDraft = useCallback(async () => {
    const validationErrors = validate()
    if (validationErrors.length > 0) {
      toast.error('Please fix errors before saving')
      return
    }
    const title = (formValues.title as string) ?? ''
    const description = (formValues.description as string) ?? ''
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          payload: { title, description, status: 'draft', category_id: categoryId || undefined },
        })
        toast.success('Draft saved')
      } else {
        await createMutation.mutateAsync({
          title,
          description,
          status: 'draft',
          category_id: categoryId || undefined,
        })
        toast.success('Draft saved')
        navigate('/dashboard/projects')
      }
    } catch {
      toast.error('Failed to save draft')
    }
  }, [formValues, categoryId, isEdit, id, validate, updateMutation, createMutation, navigate])

  const handleValidate = useCallback(() => {
    const validationErrors = validate()
    if (validationErrors.length === 0) toast.success('Validation passed')
    else toast.error(validationErrors[0] ?? 'Please fix the errors shown')
  }, [validate])

  const handlePublish = useCallback(async () => {
    const validationErrors = validate()
    if (validationErrors.length > 0) {
      toast.error('Please fix errors before publishing')
      return
    }
    const title = (formValues.title as string) ?? ''
    const description = (formValues.description as string) ?? ''
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          payload: { title, description, status: 'active', category_id: categoryId || undefined },
        })
        toast.success('Listing published')
      } else {
        await createMutation.mutateAsync({
          title,
          description,
          status: 'active',
          category_id: categoryId || undefined,
        })
        toast.success('Listing published')
      }
      navigate('/dashboard/create-edit-listing')
    } catch {
      toast.error('Failed to publish')
    }
  }, [formValues, categoryId, isEdit, id, validate, updateMutation, createMutation, navigate])

  const handleSchedulePublish = useCallback((at: string) => {
    toast.success(`Publish scheduled for ${new Date(at).toLocaleString()}`)
  }, [])

  const isSaving = createMutation.isPending || updateMutation.isPending
  const isPublishing = createMutation.isPending || updateMutation.isPending

  if (isEdit && loadingExisting && !existing) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 animate-in">
      <Link
        to="/dashboard/projects"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to listings
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        {isEdit ? 'Edit listing' : 'Create new listing'}
      </h1>

      <div className="space-y-8">
        <CategorySelector
          schemas={LISTING_FORM_SCHEMAS}
          value={categoryId}
          onChange={(id) => {
            setCategoryId(id)
            setFormValues((prev) => ({ ...prev, categoryId: id }))
          }}
        />

        {schema && (
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover rounded-2xl border border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the fields for your category.
              </p>
            </CardHeader>
            <CardContent>
              <DynamicFormEngine
                fields={schema.fields}
                values={formValues}
                onChange={updateFormValue}
                errors={formErrors}
              />
            </CardContent>
          </Card>
        )}

        <MediaUpload value={media} onChange={setMedia} />

        <PricingModule value={pricing} onChange={setPricing} />

        <AvailabilityCalendar value={availability} onChange={setAvailability} bookingMode />

        <PreviewPublishControls
          onSaveDraft={handleSaveDraft}
          onValidate={handleValidate}
          onPublish={handlePublish}
          onSchedulePublish={handleSchedulePublish}
          isSaving={isSaving}
          isValidating={false}
          isPublishing={isPublishing}
          validationErrors={Object.keys(formErrors).length > 0 ? Object.values(formErrors).filter(Boolean) : []}
        />
      </div>
    </div>
  )
}
