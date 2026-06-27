import { supabase } from './supabaseClient';

export const reviewService = {
  async getReviewsForAnime(animeId, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('anime_reviews')
      .select('*, profiles:user_id(id, full_name, avatar_url)', { count: 'exact' })
      .eq('anime_id', Number(animeId))
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) { console.error('[ReviewService] Error fetching reviews:', error.message); throw error; }
    return { reviews: data || [], count: count || 0 };
  },

  /**
   * Fetches reviews with sorting support: newest | top_rated | most_liked
   */
  async getReviewsForAnimeSorted(animeId, sort = 'newest', page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('anime_reviews')
      .select('*, profiles:user_id(id, full_name, avatar_url)', { count: 'exact' })
      .eq('anime_id', Number(animeId))
      .range(from, to);

    if (sort === 'top_rated') {
      query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
    } else {
      // newest (default)
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;
    if (error) { console.error('[ReviewService] Sort query error:', error.message); throw error; }
    return { reviews: data || [], count: count || 0 };
  },

  async getCommunityScore(animeId) {
    const { data, error } = await supabase
      .from('anime_reviews')
      .select('rating')
      .eq('anime_id', Number(animeId));
    if (error) { console.error('[ReviewService] Error fetching community score:', error.message); return { average: 0, total: 0, distribution: {} }; }
    if (!data || data.length === 0) return { average: 0, total: 0, distribution: {} };
    const totalRatings = data.length;
    const sumRatings = data.reduce((acc, curr) => acc + curr.rating, 0);
    const distribution = {};
    for (let i = 1; i <= 10; i++) distribution[i] = 0;
    data.forEach(d => { if (distribution[d.rating] !== undefined) distribution[d.rating]++; });
    return { average: sumRatings / totalRatings, total: totalRatings, distribution };
  },

  /**
   * Submits or updates a review. Now includes is_spoiler flag.
   */
  async submitReview(userId, animeId, rating, title, reviewText, isSpoiler = false) {
    if (!userId || !animeId || rating < 1 || rating > 10) throw new Error('Invalid review data');
    const { data, error } = await supabase
      .from('anime_reviews')
      .upsert(
        { user_id: userId, anime_id: Number(animeId), rating, title: title || null, review: reviewText || null, is_spoiler: !!isSpoiler, updated_at: new Date().toISOString() },
        { onConflict: 'user_id, anime_id' }
      )
      .select()
      .single();
    if (error) { console.error('[ReviewService] Error submitting review:', error.message); throw error; }
    return data;
  },

  async deleteReview(userId, animeId) {
    const { error } = await supabase.from('anime_reviews').delete().eq('user_id', userId).eq('anime_id', Number(animeId));
    if (error) { console.error('[ReviewService] Error deleting review:', error.message); throw error; }
    return true;
  },

  async getUserReviewForAnime(userId, animeId) {
    if (!userId) return null;
    const { data, error } = await supabase.from('anime_reviews').select('*').eq('user_id', userId).eq('anime_id', Number(animeId)).single();
    if (error && error.code !== 'PGRST116') console.error('[ReviewService] Error fetching user review:', error.message);
    return data || null;
  },

  async toggleLike(userId, reviewId, currentlyLiked) {
    if (!userId || !reviewId) throw new Error('Missing data for like toggle');
    if (currentlyLiked) {
      const { error } = await supabase.from('review_likes').delete().eq('user_id', userId).eq('review_id', reviewId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase.from('review_likes').insert({ user_id: userId, review_id: reviewId });
      if (error) throw error;
      return true;
    }
  },

  async getReviewLikes(reviewId, currentUserId = null) {
    const { data, error, count } = await supabase.from('review_likes').select('user_id', { count: 'exact' }).eq('review_id', reviewId);
    if (error) { console.error('[ReviewService] Error fetching likes:', error.message); return { total: 0, isLikedByMe: false }; }
    const isLikedByMe = currentUserId ? data.some(l => l.user_id === currentUserId) : false;
    return { total: count || 0, isLikedByMe };
  },

  async getUserRecentReviews(userId, limit = 5) {
    const { data, error } = await supabase.from('anime_reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) { console.error('[ReviewService] Error fetching user recent reviews:', error.message); return []; }
    return data || [];
  },

  async getUserReviewStats(userId) {
    const { data, error } = await supabase.from('anime_reviews').select('rating, anime_id').eq('user_id', userId);
    if (error) { console.error('[ReviewService] Error fetching user review stats:', error.message); return { count: 0, average: 0, highestRatedAnimeId: null, allRatings: [] }; }
    if (!data || data.length === 0) return { count: 0, average: 0, highestRatedAnimeId: null, allRatings: [] };
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    let highestScore = 0, highestRatedAnimeId = null;
    data.forEach(item => { if (item.rating > highestScore) { highestScore = item.rating; highestRatedAnimeId = item.anime_id; } });
    return { count: data.length, average: sum / data.length, highestRatedAnimeId, allRatings: data };
  },

  /**
   * Fetches all reviews written by a user for the public profile page.
   */
  async getUserReviews(userId, limit = 10) {
    if (!userId) return [];
    const { data, error } = await supabase.from('anime_reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (error) { console.error('[ReviewService] Error fetching user reviews:', error.message); return []; }
    return data || [];
  },
};

export default reviewService;
