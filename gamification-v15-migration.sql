-- ============================================================
-- AnimeLoom Milestone Beta — Gamification & User Identity v1.5
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Extend user_profiles with daily login timestamp
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login_xp_at DATE;

-- ────────────────────────────────────────────────────────────
-- 2. user_xp — centralized XP and Level tracking
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp    INTEGER DEFAULT 0 NOT NULL,
  level       INTEGER DEFAULT 1 NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_xp_level ON public.user_xp(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_total_xp ON public.user_xp(total_xp DESC);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public user_xp are viewable by everyone." ON public.user_xp
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own user_xp." ON public.user_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_xp." ON public.user_xp
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 3. user_achievements — persisted unlocks
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public achievements viewable by everyone." ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own achievements." ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 4. user_badges — earned genre and contribution badges
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id   TEXT NOT NULL,
  earned_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public badges viewable by everyone." ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own badges." ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. user_challenge_progress — weekly challenge tracking
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id  TEXT NOT NULL,
  progress      INTEGER DEFAULT 0 NOT NULL,
  completed     BOOLEAN DEFAULT false NOT NULL,
  week_start    DATE NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, challenge_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_user_challenge_user_week ON public.user_challenge_progress(user_id, week_start);

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge progress." ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own challenge progress." ON public.user_challenge_progress
  FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 6. notifications — in-app notifications history
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL, -- 'achievement' | 'level_up' | 'challenge' | 'streak'
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  is_read     BOOLEAN DEFAULT false NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications." ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications." ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications." ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
