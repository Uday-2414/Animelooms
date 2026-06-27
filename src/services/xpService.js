import { supabase } from './supabaseClient'
import { XP_REWARDS, calculateLevelInfo } from '../config/xpConfig'
import { notificationService } from './notificationService'
import { trackXPEarned, trackLevelUp } from './analyticsService'

let xpCache = {}

export const xpService = {
  /**
   * Fetches user XP record or initializes default if missing
   * @param {string} userId 
   */
  async getXP(userId) {
    if (!userId) return calculateLevelInfo(0)
    
    if (xpCache[userId] && (Date.now() - xpCache[userId].timestamp < 60000)) {
      return xpCache[userId].data
    }

    try {
      const { data, error } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('[XPService] Error fetching XP:', error.message)
      }

      let totalXP = data ? data.total_xp : 0
      
      // If row doesn't exist, try creating it lazily
      if (!data) {
        await supabase.from('user_xp').insert({ user_id: userId, total_xp: 0, level: 1 }).select()
      }

      const levelInfo = calculateLevelInfo(totalXP)
      xpCache[userId] = { data: levelInfo, timestamp: Date.now() }
      return levelInfo
    } catch (err) {
      console.warn('[XPService] Exception in getXP, returning fallback:', err)
      return calculateLevelInfo(0)
    }
  },

  /**
   * Awards XP for a specific action and handles Level Up detection and notifications
   * @param {string} userId 
   * @param {string} sourceKey Key from XP_REWARDS or numeric amount
   * @param {Object} [metadata]
   */
  async awardXP(userId, sourceKey, metadata = {}) {
    if (!userId) return null

    const amount = typeof sourceKey === 'number' ? sourceKey : (XP_REWARDS[sourceKey] || 0)
    if (amount <= 0) return null

    try {
      // Fetch current XP
      const currentLevelInfo = await this.getXP(userId)
      const oldLevel = currentLevelInfo.level
      const newTotalXP = currentLevelInfo.currentXP + amount
      const newLevelInfo = calculateLevelInfo(newTotalXP)

      // Upsert to database
      const { error } = await supabase
        .from('user_xp')
        .upsert({
          user_id: userId,
          total_xp: newTotalXP,
          level: newLevelInfo.level,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('[XPService] Error awarding XP:', error.message)
        return null
      }

      // Update cache
      xpCache[userId] = { data: newLevelInfo, timestamp: Date.now() }

      // Analytics
      trackXPEarned(sourceKey, amount, newTotalXP)

      // Check level up
      if (newLevelInfo.level > oldLevel) {
        trackLevelUp(newLevelInfo.level, newTotalXP)
        await notificationService.createNotification(
          userId,
          'level_up',
          `Level Up! You reached Level ${newLevelInfo.level}`,
          `Congratulations! You are now an ${newLevelInfo.title}.`,
          { level: newLevelInfo.level, title: newLevelInfo.title }
        )
      }

      return newLevelInfo
    } catch (err) {
      console.error('[XPService] Exception in awardXP:', err)
      return null
    }
  },

  clearCache(userId) {
    if (userId) delete xpCache[userId]
    else xpCache = {}
  }
}

export default xpService
