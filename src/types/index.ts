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
