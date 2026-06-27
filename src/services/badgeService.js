import { supabase } from './supabaseClient'
import { BADGE_MAP } from '../config/badgeConfig'
import { notificationService } from './notificationService'
import { trackBadgeEarned } from './analyticsService'

let badgeCache = {}

export const badgeService = {
  /**
   * Fetches earned badges for a user
   * @param {string} userId 
   */
  async getEarnedBadges(userId) {
    if (!userId) return []
    if (badgeCache[userId] && (Date.now() - badgeCache[userId].timestamp < 60000)) {
      return badgeCache[userId].data
    }

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('[BadgeService] Error fetching badges:', error.message)
        return []
      }

      const badges = (data || []).map(row => {
        const config = BADGE_MAP.get(row.badge_id) || {}
        return {
          ...config,
          badge_id: row.badge_id,
          earned_at: row.earned_at
        }
      })

      badgeCache[userId] = { data: badges, timestamp: Date.now() }
      return badges
    } catch (err) {
      console.warn('[BadgeService] Exception fetching badges:', err)
      return []
    }
  },

  /**
   * Awards a badge to a user
   * @param {string} userId 
   * @param {string} badgeId 
   */
  async awardBadge(userId, badgeId) {
    if (!userId || !badgeId) return null
    const config = BADGE_MAP.get(badgeId)
    if (!config) return null

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_id: badgeId })
        .select()
        .single()

      if (error) {
        if (error.code !== '23505') {
          console.error('[BadgeService] Error awarding badge:', error.message)
        }
        return null
      }

      delete badgeCache[userId]
      trackBadgeEarned(badgeId)

      await notificationService.createNotification(
        userId,
        'badge',
        `New Badge Earned: ${config.label}`,
        config.description,
        { badgeId, icon: config.icon }
      )

      return { ...config, earned_at: data.earned_at }
    } catch (err) {
      console.error('[BadgeService] Exception awarding badge:', err)
      return null
    }
  },

  /**
   * Evaluates user data and awards qualifying badges
   * @param {string} userId 
   * @param {Object} context { progressList, reviewStats, genres, level }
   */
  async checkAndAwardBadges(userId, { progressList = [], reviewStats = { count: 0 }, genres = [], level = 1 }) {
    if (!userId) return []

    try {
      const existing = await this.getEarnedBadges(userId)
      const existingSet = new Set(existing.map(b => b.badge_id || b.id))
      const toAward = []

      // Check genre badges
      const genreStr = genres.map(g => g.toLowerCase()).join(' ')
      if (genreStr.includes('action') && progressList.filter(p => p.status === 'completed' || p.status === 'watching').length >= 5) {
        toAward.push('action_expert')
      }
      if (genreStr.includes('romance') && progressList.filter(p => p.status === 'completed' || p.status === 'watching').length >= 5) {
        toAward.push('romance_fan')
      }
      if ((genreStr.includes('fantasy') || genreStr.includes('isekai')) && progressList.filter(p => p.status === 'completed' || p.status === 'watching').length >= 5) {
        toAward.push('fantasy_lover')
      }

      // Completionist
      if (progressList.length >= 10) {
        const completedRatio = progressList.filter(p => p.status === 'completed').length / progressList.length
        if (completedRatio >= 0.8) toAward.push('completionist')
      }

      // Reviewer
      if ((reviewStats.count || 0) >= 3) toAward.push('reviewer')

      // Early adopter (always awarded for users during v1.5)
      toAward.push('early_adopter')

      // Top contributor
      if (level >= 10 && (reviewStats.count || 0) >= 5) toAward.push('top_contributor')

      const newBadges = []
      for (const badgeId of toAward) {
        if (!existingSet.has(badgeId)) {
          const res = await this.awardBadge(userId, badgeId)
          if (res) newBadges.push(res)
        }
      }

      return newBadges
    } catch (err) {
      console.error('[BadgeService] Error in checkAndAwardBadges:', err)
      return []
    }
  }
}

export default badgeService
