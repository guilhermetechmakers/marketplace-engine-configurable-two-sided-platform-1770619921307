-- create_edit_listing: listing draft/published records (category-driven create/edit flow)
-- Table name uses create_edit_listing (no slash) for valid PostgreSQL identifier.
CREATE TABLE IF NOT EXISTS create_edit_listing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  category_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE create_edit_listing ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "create_edit_listing_read_own" ON create_edit_listing
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "create_edit_listing_insert_own" ON create_edit_listing
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "create_edit_listing_update_own" ON create_edit_listing
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "create_edit_listing_delete_own" ON create_edit_listing
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_edit_listing_updated_at ON create_edit_listing;
CREATE TRIGGER create_edit_listing_updated_at
  BEFORE UPDATE ON create_edit_listing
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
