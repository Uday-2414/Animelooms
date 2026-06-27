-- =================================================================================
-- ANIMELOOM RC-2: AI DISCOVERY SCHEMA MIGRATION
-- =================================================================================
-- This script adds the necessary tables to track search history and AI recommendation
-- analytics, laying the foundation for future LLM-based tuning.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. search_history TABLE
-- ---------------------------------------------------------------------------------
-- Stores user search queries (natural language) and the parsed intents to build
-- "Recent Searches" and to analyze what users are looking for.
CREATE TABLE IF NOT EXISTS public.search_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_query text NOT NULL,
    parsed_intent jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Policies for search_history (Users can only see their own searches)
CREATE POLICY "Users can insert their own searches" 
ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own searches" 
ON public.search_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches" 
ON public.search_history FOR DELETE USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------------
-- 2. recommendation_analytics TABLE
-- ---------------------------------------------------------------------------------
-- Tracks impressions and clicks on AI-generated recommendations
-- This data is vital for training or prompting an LLM on what the user actually likes.
CREATE TABLE IF NOT EXISTS public.recommendation_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    anime_id integer NOT NULL,
    recommendation_context text NOT NULL, -- e.g., 'DiscoverHub.Trending', 'WatchNext'
    action_type text NOT NULL CHECK (action_type IN ('viewed', 'clicked', 'dismissed')),
    explanation_shown text, -- The AI generated explanation shown to the user
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommendation_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for recommendation_analytics
CREATE POLICY "Users can insert their own analytics" 
ON public.recommendation_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" 
ON public.recommendation_analytics FOR SELECT USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE
-- ---------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rec_analytics_user_id ON public.recommendation_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_analytics_anime_id ON public.recommendation_analytics(anime_id);
