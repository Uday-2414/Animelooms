import { supabase } from './supabaseClient'

/**
 * Valid activity types for the community feed.
 */
export const ACTIVITY_TYPES = {
  RATED: 'rated',
  REVIEWED: 'reviewed',
  COMPLETED: 'completed',
  STARTED_WATCHING: 'started_watching',
  ADDED_TO_LIST: 'added_to_list',
}

export const activityService = {
  /**
   * Logs a user activity event to the database.
   * Fire-and-forget: errors are caught silently so they never break primary flows.
   */
  async logActivity(userId, type, animeId, animeTitle, animeImage = null, metadata = {}) {
    if (!userId || !type || !animeId || !animeTitle) return

    try {
      await supabase.from('user_activity').insert({
        user_id: userId,
        activity_type: type,
        anime_id: Number(animeId),
        anime_title: animeTitle,
        anime_image: animeImage || null,
        metadata: metadata || {},
      })
    } catch (err) {
      // Silently fail — activity logging must never break primary user flows
      console.warn('[ActivityService] Failed to log activity:', err?.message)
    }
  },

  /**
   * Fetches recent community-wide activity, joined with user profile data.
   * Used for the community feed and homepage sections.
   */
  async getRecentCommunityActivity(limit = 20) {
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        *,
        profiles:user_id (
          id,
          avatar_url,
          is_public
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[ActivityService] Error fetching community activity:', error.message)
      return []
    }

    // Filter to only include activity from users with public profiles or no profile row (fallback)
    return (data || []).filter(item => !item.profiles || item.profiles.is_public !== false)
  },

  /**
   * Fetches activity for a specific user.
   */
  async getUserActivity(userId, limit = 10) {
    if (!userId) return []

    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[ActivityService] Error fetching user activity:', error.message)
      return []
    }

    return data || []
  },
}

export default activityService
