-- =================================================================================
-- ANIMELOOM RC-1: FINAL SCHEMA UPDATES
-- =================================================================================
-- This script relaxes constraints on user_activity to allow for social events 
-- (like creating a collection or following a user) where anime_id is not applicable.
-- It also extends the user_profiles table for profile customization.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. MODIFY user_activity TABLE
-- ---------------------------------------------------------------------------------
-- First, drop the restrictive check constraint on activity_type
ALTER TABLE public.user_activity DROP CONSTRAINT IF EXISTS user_activity_activity_type_check;

-- Remove NOT NULL constraints on anime columns so we can log pure social events
ALTER TABLE public.user_activity ALTER COLUMN anime_id DROP NOT NULL;
ALTER TABLE public.user_activity ALTER COLUMN anime_title DROP NOT NULL;

-- Add a reference_id column to link to non-anime entities (like a collection ID or target user ID)
ALTER TABLE public.user_activity ADD COLUMN IF NOT EXISTS reference_id text;

-- (Optional) Re-add a more permissive check constraint if desired, but omitting it 
-- allows for maximum flexibility as we add more event types in the future.
-- ALTER TABLE public.user_activity ADD CONSTRAINT user_activity_activity_type_check 
--   CHECK (activity_type IN ('rated', 'reviewed', 'completed', 'started_watching', 'added_to_list', 'created_collection', 'updated_collection', 'followed_user'));

-- ---------------------------------------------------------------------------------
-- 2. MODIFY user_profiles TABLE
-- ---------------------------------------------------------------------------------
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS favorite_genres text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_anime_ids integer[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pinned_collection_id uuid REFERENCES public.anime_collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pinned_review_id uuid;

-- (Optional) Ensure theme_accent exists in case previous migration missed it
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS theme_accent text DEFAULT 'brand';
