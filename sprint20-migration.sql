-- Create anime_reviews table
CREATE TABLE IF NOT EXISTS public.anime_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anime_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    title TEXT,
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, anime_id)
);

-- Create review_likes table
CREATE TABLE IF NOT EXISTS public.review_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.anime_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(review_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.anime_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anime_reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.anime_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own reviews"
ON public.anime_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.anime_reviews FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.anime_reviews FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for review_likes
CREATE POLICY "Review likes are viewable by everyone"
ON public.review_likes FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own likes"
ON public.review_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.review_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger for anime_reviews
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_anime_reviews_modtime ON public.anime_reviews;
CREATE TRIGGER update_anime_reviews_modtime
    BEFORE UPDATE ON public.anime_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
