-- Seed community categories
INSERT INTO community_categories (name, emoji, slug, post_count) VALUES
  ('이직', '💼', 'career-change', 128),
  ('취준', '📝', 'job-hunting', 243),
  ('공부', '📚', 'study', 512),
  ('주식', '📈', 'stocks', 87),
  ('운동', '🏋️', 'fitness', 196)
ON CONFLICT (slug) DO NOTHING;
