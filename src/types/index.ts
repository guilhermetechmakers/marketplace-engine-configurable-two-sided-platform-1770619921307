export type Role = 'buyer' | 'seller' | 'admin' | 'moderator'

export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  role: Role
  emailVerified: boolean
  twoFactorEnabled?: boolean
  createdAt: string
}

/** 2FA - Session pending two-factor verification */
export interface SessionPending2FA {
  sessionId: string
  email: string
  role: Role
}

/** 2FA - Setup response from backend */
export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
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

/** Order/booking state machine – configurable lifecycle */
export type OrderStatus =
  | 'pending'      // created, awaiting payment
  | 'confirmed'    // paid, confirmed
  | 'in_progress'  // booking in progress
  | 'completed'    // fulfilled
  | 'cancelled'    // cancelled by user or system
  | 'refunded'     // refund processed
  | 'disputed'     // dispute opened

export interface Order {
  id: string
  listingId: string
  listing?: Listing
  buyerId: string
  sellerId: string
  status: OrderStatus
  totalCents: number
  currency: string
  quantity?: number
  createdAt: string
  updatedAt?: string
}

/** Payout record for seller */
export interface Payout {
  id: string
  sellerId: string
  amountCents: number
  currency: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  orderIds: string[]
  paidAt?: string
  createdAt: string
}

/** Listing review for display on listing detail */
export interface ListingReview {
  id: string
  listingId: string
  orderId: string
  authorId: string
  author?: User
  rating: number
  body?: string
  createdAt: string
}

export interface MessageThread {
  id: string
  listingId?: string
  participants: User[]
  lastMessage?: { body: string; createdAt: string }
  unreadCount: number
}

/** Dispute & refunds */
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'awaiting_evidence'
  | 'resolved'
  | 'refunded'
  | 'closed'

export interface DisputeEvidence {
  id: string
  disputeId: string
  uploadedBy: string
  type: 'image' | 'document' | 'note'
  url?: string
  note?: string
  createdAt: string
}

export interface DisputeTimelineEvent {
  id: string
  disputeId: string
  type: 'created' | 'status_change' | 'evidence_added' | 'resolution' | 'refund_processed'
  actorId?: string
  actorRole?: string
  payload?: Record<string, unknown>
  createdAt: string
}

export interface Dispute {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amountCents: number
  currency: string
  reason: string
  description?: string
  status: DisputeStatus
  evidence: DisputeEvidence[]
  timeline: DisputeTimelineEvent[]
  resolution?: string
  resolutionAt?: string
  refundId?: string
  createdAt: string
  updatedAt: string
}

export interface Refund {
  id: string
  disputeId: string
  orderId: string
  amountCents: number
  currency: string
  status: 'pending' | 'processed' | 'failed'
  processedAt?: string
  createdAt: string
}

/** Login/Signup page user-scoped record (e.g. preferences or state). */
export interface LoginSignupPage {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

/** Transaction mode for order/booking lifecycle. */
export type OrderTransactionMode = 'checkout' | 'booking' | 'inquiry'

/** Order / Booking History record (user-facing list of orders/bookings). */
export interface OrderBookingHistory {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  transaction_mode?: OrderTransactionMode
  amount_cents?: number
  currency?: string
  created_at: string
  updated_at: string
}

/** Timeline event for order detail. */
export interface OrderTimelineEvent {
  id: string
  order_id: string
  type: string
  label: string
  payload?: Record<string, unknown>
  created_at: string
}

/** Receipt line for order detail. */
export interface OrderReceipt {
  id: string
  order_id: string
  label: string
  amount_cents: number
  currency: string
  created_at: string
}

/** Message thread or message for order detail. */
export interface OrderMessage {
  id: string
  order_id: string
  body: string
  sender_id: string
  created_at: string
}
