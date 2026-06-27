-- ============================================================
-- AnimeLoom RC-1 Stabilization Sprint — Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Upgrade watchlist table columns for complete tracking
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS anime_title TEXT;
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS anime_image TEXT;
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS episodes_watched INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS total_episodes INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- Backfill missing columns from legacy title / image_url columns
UPDATE public.watchlist SET anime_title = title WHERE anime_title IS NULL AND title IS NOT NULL;
UPDATE public.watchlist SET anime_image = image_url WHERE anime_image IS NULL AND image_url IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 2. Performance Indexes for Watchlist & Progress
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_status ON public.watchlist(user_id, status);
CREATE INDEX IF NOT EXISTS idx_watchlist_updated_at ON public.watchlist(updated_at DESC);

-- ────────────────────────────────────────────────────────────
-- 3. Ensure Row Level Security Policies
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watchlist' AND policyname = 'Users can view their own watchlist') THEN
        CREATE POLICY "Users can view their own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watchlist' AND policyname = 'Users can insert their own watchlist items') THEN
        CREATE POLICY "Users can insert their own watchlist items" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watchlist' AND policyname = 'Users can update their own watchlist items') THEN
        CREATE POLICY "Users can update their own watchlist items" ON public.watchlist FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watchlist' AND policyname = 'Users can delete their own watchlist items') THEN
        CREATE POLICY "Users can delete their own watchlist items" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
