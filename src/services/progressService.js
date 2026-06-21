import { supabase } from './supabaseClient'

// In-memory cache for user progress to prevent duplicate/unnecessary API requests
let cache = null // Will hold array of user progress objects
let lastUserId = null

function invalidateCache() {
  cache = null
}

export const progressService = {
  /**
   * Fetches all anime progress records for a user, using cache if available.
   */
  async getProgress(userId) {
    if (!userId) return []

    // If userId changed, invalidate cache
    if (lastUserId !== userId) {
      cache = null
      lastUserId = userId
    }

    if (cache !== null) {
      return cache
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[ProgressService] Error fetching progress:', error.message)
      throw error
    }

    cache = data || []
    return cache
  },

  /**
   * Fetches progress for a specific anime ID.
   */
  async getProgressForAnime(userId, animeId) {
    if (!userId || !animeId) return null

    const allProgress = await this.getProgress(userId)
    return allProgress.find((p) => p.anime_id === Number(animeId)) || null
  },

  /**
   * Tracks a new anime (status defaults to plan_to_watch).
   */
  async addProgress(userId, anime, status = 'plan_to_watch') {
    if (!userId || !anime) throw new Error('Invalid user or anime details')

    const newRecord = {
      user_id: userId,
      anime_id: Number(anime.mal_id),
      anime_title: anime.title,
      anime_image: anime.image_url,
      status: status,
      episodes_watched: 0,
      total_episodes: anime.episodes || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic cache update
    if (cache !== null) {
      cache = [newRecord, ...cache]
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert(newRecord)
      .select()
      .single()

    if (error) {
      // Revert optimistic update on failure
      invalidateCache()
      console.error('[ProgressService] Error adding progress:', error.message)
      throw error
    }

    // Update cache with the actual database-persisted record (which includes generated ID)
    if (cache !== null) {
      cache = cache.map((item) =>
        item.anime_id === Number(anime.mal_id) ? data : item
      )
    }

    return data
  },

  /**
   * Updates an existing progress record (episodes watched, status, etc.).
   */
  async updateProgress(userId, animeId, fields) {
    if (!userId || !animeId) throw new Error('Invalid user or anime ID')

    const updateData = {
      ...fields,
      updated_at: new Date().toISOString(),
    }

    // Optimistic cache update
    if (cache !== null) {
      cache = cache.map((item) =>
        item.anime_id === Number(animeId) ? { ...item, ...updateData } : item
      )
    }

    const { data, error } = await supabase
      .from('watchlist')
      .update(updateData)
      .eq('user_id', userId)
      .eq('anime_id', Number(animeId))
      .select()
      .single()

    if (error) {
      invalidateCache()
      console.error('[ProgressService] Error updating progress:', error.message)
      throw error
    }

    // Sync cache with exact database record
    if (cache !== null) {
      cache = cache.map((item) =>
        item.anime_id === Number(animeId) ? data : item
      )
    }

    return data
  },

  /**
   * Deletes/untracks an anime progress record.
   */
  async deleteProgress(userId, animeId) {
    if (!userId || !animeId) throw new Error('Invalid user or anime ID')

    // Optimistic cache update
    if (cache !== null) {
      cache = cache.filter((item) => item.anime_id !== Number(animeId))
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', Number(animeId))

    if (error) {
      invalidateCache()
      console.error('[ProgressService] Error deleting progress:', error.message)
      throw error
    }
  },

  /**
   * Clean up / reset the in-memory cache (e.g. on logout)
   */
  clearCache() {
    cache = null
    lastUserId = null
  }
}
export default progressService
