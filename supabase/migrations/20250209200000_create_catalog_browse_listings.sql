-- catalog_browse_listings: user-scoped/saved search records (identifier uses underscore; RLS for own data)
CREATE TABLE IF NOT EXISTS catalog_browse_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE catalog_browse_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_browse_listings_read_own" ON catalog_browse_listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "catalog_browse_listings_insert_own" ON catalog_browse_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "catalog_browse_listings_update_own" ON catalog_browse_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "catalog_browse_listings_delete_own" ON catalog_browse_listings
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_catalog_browse_listings_user_id ON catalog_browse_listings(user_id);
