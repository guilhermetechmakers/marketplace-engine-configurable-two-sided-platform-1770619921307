-- login_signup_page: user-scoped record for login/signup page (e.g. preferences/state).
-- Using login_signup_page as table name (safe identifier). For literal "login_/_signup_page" use double quotes in PostgreSQL.
CREATE TABLE IF NOT EXISTS login_signup_page (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE login_signup_page ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "login_signup_page_read_own" ON login_signup_page
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "login_signup_page_insert_own" ON login_signup_page
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "login_signup_page_update_own" ON login_signup_page
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "login_signup_page_delete_own" ON login_signup_page
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: if your project uses the literal table name "login_/_signup_page", uncomment below:
-- CREATE TABLE IF NOT EXISTS "login_/_signup_page" (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   title TEXT NOT NULL,
--   description TEXT,
--   status TEXT DEFAULT 'active',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- ALTER TABLE "login_/_signup_page" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "login_/_signup_page_read_own" ON "login_/_signup_page" FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "login_/_signup_page_insert_own" ON "login_/_signup_page" FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "login_/_signup_page_update_own" ON "login_/_signup_page" FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "login_/_signup_page_delete_own" ON "login_/_signup_page" FOR DELETE USING (auth.uid() = user_id);
