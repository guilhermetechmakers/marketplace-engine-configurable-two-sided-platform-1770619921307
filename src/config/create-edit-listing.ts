import type { ListingCategorySchema } from '@/types'

/** Category-driven listing form schemas (loaded when user selects category). */
export const LISTING_FORM_SCHEMAS: ListingCategorySchema[] = [
  {
    categoryId: 'cat-1',
    categoryName: 'Services',
    slug: 'services',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Professional photography session', hint: 'Clear, descriptive title works best.', example: '1-hour portrait photography' },
      { key: 'description', label: 'Description', type: 'rich-text', required: true, hint: 'Describe what you offer, duration, and what’s included.' },
      { key: 'duration_hours', label: 'Duration (hours)', type: 'number', required: true, min: 0.5, max: 24, step: 0.5, hint: 'Typical session length.' },
      { key: 'location_type', label: 'Location', type: 'select', required: true, options: [{ value: 'remote', label: 'Remote' }, { value: 'onsite', label: 'On-site' }, { value: 'flexible', label: 'Flexible' }], hint: 'Where the service is delivered.' },
      { key: 'location_address', label: 'Address or area', type: 'location', showWhen: { field: 'location_type', oneOf: ['onsite', 'flexible'] }, hint: 'City or area for on-site services.' },
      { key: 'experience_years', label: 'Years of experience', type: 'number', min: 0, max: 50, step: 1, hint: 'Optional.' },
    ],
  },
  {
    categoryId: 'cat-2',
    categoryName: 'Rentals',
    slug: 'rentals',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Cozy downtown apartment', hint: 'Short, appealing title.' },
      { key: 'description', label: 'Description', type: 'rich-text', required: true, hint: 'Describe the space, amenities, and rules.' },
      { key: 'bedrooms', label: 'Bedrooms', type: 'number', required: true, min: 1, max: 20, step: 1, hint: 'Number of bedrooms.' },
      { key: 'bathrooms', label: 'Bathrooms', type: 'number', min: 1, max: 10, step: 0.5, hint: 'Number of bathrooms.' },
      { key: 'location', label: 'Location', type: 'location', required: true, hint: 'Address or area.' },
      { key: 'check_in_time', label: 'Check-in time', type: 'text', placeholder: 'e.g. 3:00 PM', hint: 'Default check-in.' },
      { key: 'check_out_time', label: 'Check-out time', type: 'text', placeholder: 'e.g. 11:00 AM', hint: 'Default check-out.' },
    ],
  },
  {
    categoryId: 'cat-3',
    categoryName: 'Goods',
    slug: 'goods',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Vintage camera bundle', hint: 'Product name and key detail.' },
      { key: 'description', label: 'Description', type: 'rich-text', required: true, hint: 'Condition, specs, and what’s included.' },
      { key: 'condition', label: 'Condition', type: 'select', required: true, options: [{ value: 'new', label: 'New' }, { value: 'like_new', label: 'Like new' }, { value: 'good', label: 'Good' }, { value: 'used', label: 'Used' }], hint: 'Item condition.' },
      { key: 'brand', label: 'Brand', type: 'text', hint: 'Optional.' },
      { key: 'location', label: 'Pickup / shipping location', type: 'location', hint: 'For local pickup or shipping origin.' },
      { key: 'shipping_available', label: 'Shipping available', type: 'boolean', hint: 'Can you ship this item?' },
    ],
  },
]

export function getListingFormSchemaByCategoryId(categoryId: string): ListingCategorySchema | undefined {
  return LISTING_FORM_SCHEMAS.find((s) => s.categoryId === categoryId)
}

export function getListingFormSchemaBySlug(slug: string): ListingCategorySchema | undefined {
  return LISTING_FORM_SCHEMAS.find((s) => s.slug === slug)
}
