import { supabase } from './supabaseClient';

export const reviewService = {
  /**
   * Fetches reviews for a specific anime with pagination.
   */
  async getReviewsForAnime(animeId, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('anime_reviews')
      .select('*, profiles:user_id(id, full_name, avatar_url)', { count: 'exact' })
      .eq('anime_id', Number(animeId))
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[ReviewService] Error fetching reviews:', error.message);
      throw error;
    }

    return { reviews: data || [], count: count || 0 };
  },

  /**
   * Fetches the aggregated community score and total ratings for an anime.
   */
  async getCommunityScore(animeId) {
    const { data, error } = await supabase
      .from('anime_reviews')
      .select('rating')
      .eq('anime_id', Number(animeId));

    if (error) {
      console.error('[ReviewService] Error fetching community score:', error.message);
      return { average: 0, total: 0 };
    }

    if (!data || data.length === 0) {
      return { average: 0, total: 0 };
    }

    const totalRatings = data.length;
    const sumRatings = data.reduce((acc, curr) => acc + curr.rating, 0);
    const averageScore = sumRatings / totalRatings;

    return { average: averageScore, total: totalRatings };
  },

  /**
   * Submits or updates a user rating and review for an anime.
   */
  async submitReview(userId, animeId, rating, title, reviewText) {
    if (!userId || !animeId || rating < 1 || rating > 10) {
      throw new Error('Invalid review data');
    }

    // Upsert relies on the unique constraint (user_id, anime_id)
    const { data, error } = await supabase
      .from('anime_reviews')
      .upsert(
        {
          user_id: userId,
          anime_id: Number(animeId),
          rating: rating,
          title: title || null,
          review: reviewText || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, anime_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[ReviewService] Error submitting review:', error.message);
      throw error;
    }

    return data;
  },

  /**
   * Deletes a user's review.
   */
  async deleteReview(userId, animeId) {
    const { error } = await supabase
      .from('anime_reviews')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', Number(animeId));

    if (error) {
      console.error('[ReviewService] Error deleting review:', error.message);
      throw error;
    }
    return true;
  },

  /**
   * Fetches the authenticated user's review for a specific anime.
   */
  async getUserReviewForAnime(userId, animeId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('anime_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('anime_id', Number(animeId))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('[ReviewService] Error fetching user review:', error.message);
    }

    return data || null;
  },

  /**
   * Toggles a like on a review.
   */
  async toggleLike(userId, reviewId, currentlyLiked) {
    if (!userId || !reviewId) throw new Error('Missing data for like toggle');

    if (currentlyLiked) {
      const { error } = await supabase
        .from('review_likes')
        .delete()
        .eq('user_id', userId)
        .eq('review_id', reviewId);
      if (error) throw error;
      return false; // Now unliked
    } else {
      const { error } = await supabase
        .from('review_likes')
        .insert({ user_id: userId, review_id: reviewId });
      if (error) throw error;
      return true; // Now liked
    }
  },

  /**
   * Gets the total likes for a review and if the current user liked it.
   */
  async getReviewLikes(reviewId, currentUserId = null) {
    const { data, error, count } = await supabase
      .from('review_likes')
      .select('user_id', { count: 'exact' })
      .eq('review_id', reviewId);

    if (error) {
      console.error('[ReviewService] Error fetching likes:', error.message);
      return { total: 0, isLikedByMe: false };
    }

    const isLikedByMe = currentUserId ? data.some(l => l.user_id === currentUserId) : false;
    return { total: count || 0, isLikedByMe };
  },

  /**
   * Fetches recent reviews written by the current user.
   */
  async getUserRecentReviews(userId, limit = 5) {
    const { data, error } = await supabase
      .from('anime_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ReviewService] Error fetching user recent reviews:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetches all reviews written by the current user to calculate profile statistics.
   */
  async getUserReviewStats(userId) {
    const { data, error } = await supabase
      .from('anime_reviews')
      .select('rating, anime_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[ReviewService] Error fetching user review stats:', error.message);
      return { count: 0, average: 0, highestRatedAnimeId: null, allRatings: [] };
    }

    if (!data || data.length === 0) return { count: 0, average: 0, highestRatedAnimeId: null, allRatings: [] };

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / data.length;

    let highestScore = 0;
    let highestRatedAnimeId = null;
    
    data.forEach(item => {
      if (item.rating > highestScore) {
        highestScore = item.rating;
        highestRatedAnimeId = item.anime_id;
      }
    });

    return { 
      count: data.length, 
      average, 
      highestRatedAnimeId, 
      allRatings: data 
    };
  }
};
