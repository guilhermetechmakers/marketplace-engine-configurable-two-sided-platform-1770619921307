export type Role = 'buyer' | 'seller' | 'admin' | 'moderator'

export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  role: Role
  emailVerified: boolean
  createdAt: string
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  categoryId: string
  categoryName?: string
  sellerId: string
  seller?: User
  images: string[]
  attributes: Record<string, unknown>
  status: 'draft' | 'active' | 'paused' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  schema?: Record<string, unknown>
}

export interface Order {
  id: string
  listingId: string
  listing?: Listing
  buyerId: string
  sellerId: string
  status: string
  totalCents: number
  currency: string
  createdAt: string
}

export interface MessageThread {
  id: string
  listingId?: string
  participants: User[]
  lastMessage?: { body: string; createdAt: string }
  unreadCount: number
}
