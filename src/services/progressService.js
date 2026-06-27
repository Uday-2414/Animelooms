import { supabase } from './supabaseClient'
import { activityService, ACTIVITY_TYPES } from './activityService'
import { xpService } from './xpService'
import { challengeService } from './challengeService'

// In-memory cache for user progress to prevent duplicate/unnecessary API requests
let cache = null
let lastUserId = null

function invalidateCache() {
  cache = null
}

export const progressService = {
  async getProgress(userId) {
    if (!userId) return []
    if (lastUserId !== userId) { cache = null; lastUserId = userId }
    if (cache !== null) return cache
    const { data, error } = await supabase.from('watchlist').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
    if (error) { console.error('[ProgressService] Error fetching progress:', error.message); throw error }
    cache = data || []
    return cache
  },

  async getProgressForAnime(userId, animeId) {
    if (!userId || !animeId) return null
    const allProgress = await this.getProgress(userId)
    return allProgress.find((p) => p.anime_id === Number(animeId)) || null
  },

  async addProgress(userId, anime, status = 'plan_to_watch') {
    if (!userId || !anime) throw new Error('Invalid user or anime details')
    const newRecord = {
      user_id: userId,
      anime_id: Number(anime.mal_id),
      anime_title: anime.title,
      anime_image: anime.image_url,
      status,
      episodes_watched: 0,
      total_episodes: anime.episodes || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (cache !== null) cache = [newRecord, ...cache]
    const { data, error } = await supabase.from('watchlist').insert(newRecord).select().single()
    if (error) { invalidateCache(); console.error('[ProgressService] Error adding progress:', error.message); throw error }
    if (cache !== null) cache = cache.map((item) => item.anime_id === Number(anime.mal_id) ? data : item)

    // Log activity — fire and forget
    const activityType = status === 'watching'
      ? ACTIVITY_TYPES.STARTED_WATCHING
      : ACTIVITY_TYPES.ADDED_TO_LIST
    activityService.logActivity(userId, activityType, anime.mal_id, anime.title, anime.image_url, { status })

    // Award XP & update challenges — fire and forget
    xpService.awardXP(userId, 'anime_added')
    challengeService.incrementProgress(userId, 'additions', 1)

    return data
  },

  async updateProgress(userId, animeId, fields) {
    if (!userId || !animeId) throw new Error('Invalid user or anime ID')
    
    // Check old item for diffs
    const oldItem = await this.getProgressForAnime(userId, animeId)

    const updateData = { ...fields, updated_at: new Date().toISOString() }
    if (cache !== null) cache = cache.map((item) => item.anime_id === Number(animeId) ? { ...item, ...updateData } : item)
    const { data, error } = await supabase.from('watchlist').update(updateData).eq('user_id', userId).eq('anime_id', Number(animeId)).select().single()
    if (error) { invalidateCache(); console.error('[ProgressService] Error updating progress:', error.message); throw error }
    if (cache !== null) cache = cache.map((item) => item.anime_id === Number(animeId) ? data : item)

    // Log activity for meaningful status changes — fire and forget
    if (fields.status === 'completed') {
      activityService.logActivity(userId, ACTIVITY_TYPES.COMPLETED, data.anime_id, data.anime_title, data.anime_image, { episodes_watched: data.episodes_watched })
      xpService.awardXP(userId, 'anime_completed')
      challengeService.incrementProgress(userId, 'completions', 1)
    } else if (fields.status === 'watching') {
      activityService.logActivity(userId, ACTIVITY_TYPES.STARTED_WATCHING, data.anime_id, data.anime_title, data.anime_image, {})
    }

    if (fields.episodes_watched !== undefined && oldItem) {
      const epDiff = fields.episodes_watched - (oldItem.episodes_watched || 0)
      if (epDiff > 0) {
        xpService.awardXP(userId, 'episode_updated', { diff: epDiff })
        challengeService.incrementProgress(userId, 'episodes', epDiff)
      }
    }

    return data
  },

  async deleteProgress(userId, animeId) {
    if (!userId || !animeId) throw new Error('Invalid user or anime ID')
    if (cache !== null) cache = cache.filter((item) => item.anime_id !== Number(animeId))
    const { error } = await supabase.from('watchlist').delete().eq('user_id', userId).eq('anime_id', Number(animeId))
    if (error) { invalidateCache(); console.error('[ProgressService] Error deleting progress:', error.message); throw error }
  },

  clearCache() {
    cache = null
    lastUserId = null
  },

  /**
   * Counts how many users are watching a specific anime.
   */
  async getWatchingCount(animeId) {
    if (!animeId) return 0
    const { count, error } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('anime_id', Number(animeId))
      .eq('status', 'watching')
    if (error) { console.warn('[ProgressService] Error counting watchers:', error.message); return 0 }
    return count || 0
  },
}

export default progressService
