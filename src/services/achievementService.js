import { supabase } from './supabaseClient'
import { ACHIEVEMENT_MAP } from '../config/achievementConfig'
import { xpService } from './xpService'
import { notificationService } from './notificationService'
import { evaluateAchievements } from '../engines/achievementEngine'
import { trackAchievementUnlocked } from './analyticsService'

let achievementCache = {}

export const achievementService = {
  /**
   * Fetches all unlocked achievements for a given user
   * @param {string} userId 
   */
  async getUnlockedAchievements(userId) {
    if (!userId) return []
    
    if (achievementCache[userId] && (Date.now() - achievementCache[userId].timestamp < 60000)) {
      return achievementCache[userId].data
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('[AchievementService] Error fetching achievements:', error.message)
        return []
      }

      const unlocked = (data || []).map(row => {
        const config = ACHIEVEMENT_MAP.get(row.achievement_id) || {}
        return {
          ...config,
          achievement_id: row.achievement_id,
          unlocked_at: row.unlocked_at
        }
      })

      achievementCache[userId] = { data: unlocked, timestamp: Date.now() }
      return unlocked
    } catch (err) {
      console.warn('[AchievementService] Exception fetching achievements:', err)
      return []
    }
  },

  /**
   * Unlocks an achievement for a user if not already unlocked
   * @param {string} userId 
   * @param {string} achievementId 
   */
  async unlock(userId, achievementId) {
    if (!userId || !achievementId) return null
    const config = ACHIEVEMENT_MAP.get(achievementId)
    if (!config) return null

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: achievementId })
        .select()
        .single()

      if (error) {
        // Code 23505 means duplicate key / already unlocked
        if (error.code !== '23505') {
          console.error('[AchievementService] Error unlocking achievement:', error.message)
        }
        return null
      }

      delete achievementCache[userId]

      // Award XP for unlocking achievement
      if (config.xpReward) {
        await xpService.awardXP(userId, config.xpReward, { achievementId })
      }

      // Track analytics
      trackAchievementUnlocked(achievementId, config.title)

      // Create notification
      await notificationService.createNotification(
        userId,
        'achievement',
        `Achievement Unlocked: ${config.title}`,
        config.description,
        { achievementId, icon: config.icon }
      )

      return { ...config, unlocked_at: data.unlocked_at }
    } catch (err) {
      console.error('[AchievementService] Exception unlocking achievement:', err)
      return null
    }
  },

  /**
   * Evaluates and unlocks any newly earned achievements for a user based on current context
   * @param {string} userId 
   * @param {Object} context { progressList, reviewStats, streak }
   */
  async checkAndUnlock(userId, context) {
    if (!userId || !context) return []
    try {
      const currentlyUnlocked = await this.getUnlockedAchievements(userId)
      const unlockedSet = new Set(currentlyUnlocked.map(a => a.achievement_id || a.id))
      const qualifiedIds = evaluateAchievements(context)

      const newlyUnlocked = []
      for (const achId of qualifiedIds) {
        if (!unlockedSet.has(achId)) {
          const res = await this.unlock(userId, achId)
          if (res) newlyUnlocked.push(res)
        }
      }
      return newlyUnlocked
    } catch (err) {
      console.error('[AchievementService] Error in checkAndUnlock:', err)
      return []
    }
  },

  clearCache(userId) {
    if (userId) delete achievementCache[userId]
    else achievementCache = {}
  }
}

export default achievementService
