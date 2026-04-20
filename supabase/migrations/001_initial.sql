-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  name text NOT NULL,
  member_color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view their group" ON groups FOR SELECT
  USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create groups" ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Anyone can read group by invite_code" ON groups FOR SELECT USING (true);

-- Group membership
CREATE TABLE group_members (
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view group membership" ON group_members FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 100),
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view posts" ON posts FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create posts in their group" ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Reactions
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view reactions" ON reactions FOR SELECT
  USING (post_id IN (SELECT id FROM posts WHERE group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )));
CREATE POLICY "Users can add reactions" ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Community categories
CREATE TABLE community_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text NOT NULL,
  slug text UNIQUE NOT NULL,
  post_count int DEFAULT 0
);

ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community categories" ON community_categories FOR SELECT USING (true);

-- Community posts
CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES community_categories(id),
  tag text,
  title text NOT NULL,
  preview text,
  view_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community posts" ON community_posts FOR SELECT USING (true);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
