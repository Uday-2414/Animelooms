-- =================================================================================
-- ANIMELOOM MILESTONE DELTA: IDENTITY, COLLECTIONS & SOCIAL DISCOVERY
-- =================================================================================
-- This migration upgrades the database to support social features including:
-- 1. Custom Anime Collections (with future nested support)
-- 2. Enhanced User Profiles (username constraints, bio)
-- 3. Follower Graph (follower/following)
-- 4. Realtime Notifications
-- 5. Expanded Activity Feed
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. USER PROFILES EXTENSION
-- ---------------------------------------------------------------------------------
-- Ensure citext is enabled for case-insensitive username checks if not already
CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS username citext UNIQUE CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS theme_accent text DEFAULT 'brand',
  ADD COLUMN IF NOT EXISTS pinned_anime_id integer;

-- ---------------------------------------------------------------------------------
-- 2. ANIME COLLECTIONS
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anime_collections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_collection_id uuid REFERENCES public.anime_collections(id) ON DELETE CASCADE, -- For future nesting
    title text NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 100),
    description text,
    cover_image text,
    is_public boolean DEFAULT true,
    likes_count integer DEFAULT 0,
    saves_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Index for fast user collection lookups
CREATE INDEX IF NOT EXISTS idx_anime_collections_user_id ON public.anime_collections(user_id);
-- Index for discovering public collections
CREATE INDEX IF NOT EXISTS idx_anime_collections_is_public ON public.anime_collections(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE public.anime_collections ENABLE ROW LEVEL SECURITY;

-- Policies for Collections
CREATE POLICY "Collections are viewable by everyone if public" 
    ON public.anime_collections FOR SELECT 
    USING (is_public = true);

CREATE POLICY "Users can view their own private collections" 
    ON public.anime_collections FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" 
    ON public.anime_collections FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
    ON public.anime_collections FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
    ON public.anime_collections FOR DELETE 
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------------
-- 3. COLLECTION ITEMS
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collection_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id uuid REFERENCES public.anime_collections(id) ON DELETE CASCADE NOT NULL,
    anime_id integer NOT NULL,
    anime_title text NOT NULL,
    anime_image text,
    sort_order integer DEFAULT 0,
    added_at timestamp with time zone DEFAULT now(),
    UNIQUE(collection_id, anime_id) -- Prevent duplicate anime in same collection
);

-- Index for fetching items of a collection
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);

-- Enable RLS
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Policies for Collection Items (inherit from parent collection)
CREATE POLICY "Collection items are viewable if parent is public" 
    ON public.collection_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.anime_collections 
            WHERE id = collection_items.collection_id AND is_public = true
        )
    );

CREATE POLICY "Users can view items of their own collections" 
    ON public.collection_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.anime_collections 
            WHERE id = collection_items.collection_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items to their own collections" 
    ON public.collection_items FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.anime_collections 
            WHERE id = collection_items.collection_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their own collections" 
    ON public.collection_items FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.anime_collections 
            WHERE id = collection_items.collection_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their own collections" 
    ON public.collection_items FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.anime_collections 
            WHERE id = collection_items.collection_id AND user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------------
-- 4. SOCIAL GRAPH (FOLLOWERS)
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Index to quickly find who a user is following
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
-- Index to quickly find a user's followers
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Policies for Follows
CREATE POLICY "Follows are viewable by everyone" 
    ON public.user_follows FOR SELECT 
    USING (true);

CREATE POLICY "Users can follow others" 
    ON public.user_follows FOR INSERT 
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
    ON public.user_follows FOR DELETE 
    USING (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------------
-- 5. NOTIFICATIONS
-- ---------------------------------------------------------------------------------
-- Safely create the table if it didn't exist at all
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL,
    title text,
    body text,
    metadata jsonb,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Add social columns if they don't exist (Gamification compatibility)
ALTER TABLE public.notifications 
    ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS reference_id text;

-- Index for fetching a user's unread notifications quickly
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (e.g., mark as read)" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- Note: In a production Supabase app, inserting notifications is usually done via Postgres Triggers
-- or Edge Functions (service role) to prevent spoofing. However, for client-side logging we allow 
-- authenticated users to insert notifications if they are the actor.
CREATE POLICY "Actors can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.uid() = actor_id);

-- ---------------------------------------------------------------------------------
-- 6. TRIGGERS (Auto-updated_at)
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_anime_collections_modtime ON public.anime_collections;
CREATE TRIGGER update_anime_collections_modtime 
    BEFORE UPDATE ON public.anime_collections 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- =================================================================================
-- ENABLE REALTIME FOR NOTIFICATIONS
-- =================================================================================
-- IMPORTANT: To enable Realtime for notifications, you must configure it through 
-- your Supabase Dashboard:
-- 1. Go to Database -> Replication
-- 2. Click on "0 tables" (or X tables) next to supabase_realtime
-- 3. Toggle the switch for the "notifications" table
-- 4. Click Save
-- =================================================================================
