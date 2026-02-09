import type { CategoryConfigNode } from '@/types'

/** Hierarchical category tree for browse listings facets (driven by config). */
export const CATEGORY_TREE: CategoryConfigNode[] = [
  {
    id: 'cat-1',
    name: 'Services',
    slug: 'services',
    schema: {
      duration: {
        type: 'range',
        min: 0.5,
        max: 8,
        step: 0.5,
      },
      location: {
        type: 'select',
        options: [
          { value: 'remote', label: 'Remote' },
          { value: 'onsite', label: 'On-site' },
          { value: 'flexible', label: 'Flexible' },
        ],
      },
    },
    children: [
      { id: 'cat-1a', name: 'Photography', slug: 'photography', children: [] },
      { id: 'cat-1b', name: 'Lessons', slug: 'lessons', children: [] },
    ],
  },
  {
    id: 'cat-2',
    name: 'Rentals',
    slug: 'rentals',
    schema: {
      priceMin: { type: 'range', min: 0, max: 500, step: 10 },
      priceMax: { type: 'range', min: 0, max: 2000, step: 50 },
      bedrooms: {
        type: 'checkbox',
        options: [
          { value: '1', label: '1 bed' },
          { value: '2', label: '2 beds' },
          { value: '3', label: '3+ beds' },
        ],
      },
    },
    children: [
      { id: 'cat-2a', name: 'Apartments', slug: 'apartments', children: [] },
      { id: 'cat-2b', name: 'Vacation', slug: 'vacation', children: [] },
    ],
  },
  {
    id: 'cat-3',
    name: 'Goods',
    slug: 'goods',
    schema: {
      condition: {
        type: 'select',
        options: [
          { value: 'new', label: 'New' },
          { value: 'like_new', label: 'Like new' },
          { value: 'good', label: 'Good' },
          { value: 'used', label: 'Used' },
        ],
      },
    },
    children: [
      { id: 'cat-3a', name: 'Electronics', slug: 'electronics', children: [] },
      { id: 'cat-3b', name: 'Handmade', slug: 'handmade', children: [] },
    ],
  },
]

/** Default radius options for location search (km). */
export const RADIUS_OPTIONS_KM = [5, 10, 25, 50, 100, 200]

/** Location autocomplete suggestions (mock; replace with API in production). */
export const LOCATION_SUGGESTIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'San Francisco, CA',
  'Seattle, WA',
  'Boston, MA',
  'Austin, TX',
]
