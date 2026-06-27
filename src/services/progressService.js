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

function normalizeProgressItem(raw) {
  if (!raw) return null
  const title = raw.anime_title || raw.title || 'Untitled Anime'
  const image = raw.anime_image || raw.image_url || ''
  return {
    id: raw.id,
    user_id: raw.user_id,
    anime_id: Number(raw.anime_id),
    title,
    anime_title: title,
    image_url: image,
    anime_image: image,
    status: raw.status || 'plan_to_watch',
    episodes_watched: Number(raw.episodes_watched ?? 0),
    total_episodes: Number(raw.total_episodes ?? 0),
    score: raw.score ?? null,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || raw.created_at || new Date().toISOString(),
  }
}

export const progressService = {
  async getProgress(userId) {
    if (!userId) return []
    if (lastUserId !== userId) { cache = null; lastUserId = userId }
    if (cache !== null) return cache

    let data = null
    let error = null

    // Try ordering by updated_at, fallback to created_at if column missing
    const res1 = await supabase.from('watchlist').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
    if (res1.error && res1.error.message.includes('updated_at')) {
      const res2 = await supabase.from('watchlist').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      data = res2.data
      error = res2.error
    } else {
      data = res1.data
      error = res1.error
    }

    if (error) {
      console.error('[ProgressService] Error fetching progress:', error.message)
      throw error
    }

    cache = (data || []).map(normalizeProgressItem)
    return cache
  },

  async getProgressForAnime(userId, animeId) {
    if (!userId || !animeId) return null
    const allProgress = await this.getProgress(userId)
    return allProgress.find((p) => p.anime_id === Number(animeId)) || null
  },

  async addProgress(userId, anime, status = 'plan_to_watch') {
    if (!userId || !anime) throw new Error('Invalid user or anime details')

    const fullRecord = {
      user_id: userId,
      anime_id: Number(anime.mal_id),
      title: anime.title,
      anime_title: anime.title,
      image_url: anime.image_url,
      anime_image: anime.image_url,
      status,
      episodes_watched: 0,
      total_episodes: anime.episodes || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let insertedData = null
    let insertError = null

    // Try full insert first
    const res = await supabase.from('watchlist').insert(fullRecord).select().single()
    if (res.error) {
      // Fallback for pre-migration table schema
      const fallbackRecord = {
        user_id: userId,
        anime_id: Number(anime.mal_id),
        title: anime.title,
        image_url: anime.image_url,
        status,
        created_at: new Date().toISOString(),
      }
      const resFallback = await supabase.from('watchlist').insert(fallbackRecord).select().single()
      insertedData = resFallback.data
      insertError = resFallback.error
    } else {
      insertedData = res.data
    }

    if (insertError) {
      invalidateCache()
      console.error('[ProgressService] Error adding progress:', insertError.message)
      throw new Error(`Database insert failed: ${insertError.message}`)
    }

    const normalized = normalizeProgressItem(insertedData || fullRecord)
    if (cache !== null) cache = [normalized, ...cache.filter(i => i.anime_id !== normalized.anime_id)]

    // Log activity — fire and forget
    const activityType = status === 'watching'
      ? ACTIVITY_TYPES.STARTED_WATCHING
      : ACTIVITY_TYPES.ADDED_TO_LIST
    activityService.logActivity(userId, activityType, anime.mal_id, anime.title, anime.image_url, { status })

    // Award XP & update challenges — fire and forget
    xpService.awardXP(userId, 'anime_added')
    challengeService.incrementProgress(userId, 'additions', 1)

    return normalized
  },

  async updateProgress(userId, animeId, fields) {
    if (!userId || !animeId) throw new Error('Invalid user or anime ID')
    
    const oldItem = await this.getProgressForAnime(userId, animeId)
    const updateData = { ...fields, updated_at: new Date().toISOString() }

    let res = await supabase.from('watchlist').update(updateData).eq('user_id', userId).eq('anime_id', Number(animeId)).select().single()
    if (res.error) {
      // Fallback if updated_at / episodes columns don't exist in DB yet
      const fallbackUpdate = { status: fields.status }
      res = await supabase.from('watchlist').update(fallbackUpdate).eq('user_id', userId).eq('anime_id', Number(animeId)).select().single()
    }

    if (res.error) {
      invalidateCache()
      console.error('[ProgressService] Error updating progress:', res.error.message)
      throw new Error(`Database update failed: ${res.error.message}`)
    }

    const normalized = normalizeProgressItem(res.data)
    if (cache !== null) cache = cache.map((item) => item.anime_id === Number(animeId) ? normalized : item)

    // Log activity for meaningful status changes — fire and forget
    if (fields.status === 'completed') {
      activityService.logActivity(userId, ACTIVITY_TYPES.COMPLETED, normalized.anime_id, normalized.anime_title, normalized.anime_image, { episodes_watched: normalized.episodes_watched })
      xpService.awardXP(userId, 'anime_completed')
      challengeService.incrementProgress(userId, 'completions', 1)
    } else if (fields.status === 'watching') {
      activityService.logActivity(userId, ACTIVITY_TYPES.STARTED_WATCHING, normalized.anime_id, normalized.anime_title, normalized.anime_image, {})
    }

    if (fields.episodes_watched !== undefined && oldItem) {
      const epDiff = fields.episodes_watched - (oldItem.episodes_watched || 0)
      if (epDiff > 0) {
        xpService.awardXP(userId, 'episode_updated', { diff: epDiff })
        challengeService.incrementProgress(userId, 'episodes', epDiff)
      }
    }

    return normalized
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
