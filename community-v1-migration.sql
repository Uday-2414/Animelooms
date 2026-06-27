-- ============================================================
-- AnimeLoom Community Foundation v1.0 — Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. user_profiles — public profile data per user
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT        UNIQUE,
  bio         TEXT        CHECK (char_length(bio) <= 500),
  avatar_url  TEXT,
  is_public   BOOLEAN     DEFAULT true NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON public.user_profiles(is_public);

-- ────────────────────────────────────────────────────────────
-- 2. user_activity — append-only community activity log
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_activity (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT        NOT NULL CHECK (activity_type IN (
    'rated',
    'reviewed',
    'completed',
    'started_watching',
    'added_to_list'
  )),
  anime_id      INTEGER     NOT NULL,
  anime_title   TEXT        NOT NULL,
  anime_image   TEXT,
  metadata      JSONB       DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id    ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_anime_id   ON public.user_activity(anime_id);

-- ────────────────────────────────────────────────────────────
-- 3. review_reports — moderation foundation (no admin UI yet)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.review_reports (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id   UUID        NOT NULL REFERENCES public.anime_reviews(id) ON DELETE CASCADE,
  reporter_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      TEXT        NOT NULL CHECK (char_length(reason) <= 500),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(review_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON public.review_reports(review_id);

-- ────────────────────────────────────────────────────────────
-- 4. Extend anime_reviews — add spoiler flag
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.anime_reviews
  ADD COLUMN IF NOT EXISTS is_spoiler BOOLEAN DEFAULT false NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 5. RLS — user_profiles
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 6. RLS — user_activity (public read, own insert, append-only)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity is viewable by everyone"
  ON public.user_activity FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE — activity is append-only by design

-- ────────────────────────────────────────────────────────────
-- 7. RLS — review_reports (own insert, no public read)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own reports"
  ON public.review_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admin reads via service role key only (no public SELECT policy)

-- ────────────────────────────────────────────────────────────
-- 8. Auto-update trigger for user_profiles.updated_at
-- ────────────────────────────────────────────────────────────
-- Reuse existing update_modified_column() function from sprint20-migration.sql
DROP TRIGGER IF EXISTS update_user_profiles_modtime ON public.user_profiles;
CREATE TRIGGER update_user_profiles_modtime
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ────────────────────────────────────────────────────────────
-- 9. Performance index on anime_reviews for sort queries
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_anime_reviews_anime_id_rating
  ON public.anime_reviews(anime_id, rating DESC);

CREATE INDEX IF NOT EXISTS idx_anime_reviews_anime_id_created
  ON public.anime_reviews(anime_id, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- Done. Run this in the Supabase SQL Editor.
-- ────────────────────────────────────────────────────────────
