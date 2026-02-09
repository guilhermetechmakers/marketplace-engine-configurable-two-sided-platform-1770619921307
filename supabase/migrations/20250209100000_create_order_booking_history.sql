-- order_booking_history: user-facing list of orders/bookings (Transaction Lifecycle & Order State Machine).
-- Safe identifier for order_/_booking_history.
CREATE TABLE IF NOT EXISTS order_booking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  transaction_mode TEXT CHECK (transaction_mode IN ('checkout', 'booking', 'inquiry')),
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_booking_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "order_booking_history_read_own" ON order_booking_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "order_booking_history_insert_own" ON order_booking_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "order_booking_history_update_own" ON order_booking_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "order_booking_history_delete_own" ON order_booking_history
  FOR DELETE USING (auth.uid() = user_id);

-- Index for list filters
CREATE INDEX IF NOT EXISTS idx_order_booking_history_user_created
  ON order_booking_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_booking_history_status
  ON order_booking_history (user_id, status);
CREATE INDEX IF NOT EXISTS idx_order_booking_history_transaction_mode
  ON order_booking_history (user_id, transaction_mode);
