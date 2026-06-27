import { supabase } from './supabaseClient'
import { WEEKLY_CHALLENGES, CHALLENGE_MAP } from '../config/challengeConfig'
import { xpService } from './xpService'
import { notificationService } from './notificationService'
import { trackChallengeCompleted } from './analyticsService'

function getMonday(d = new Date()) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(date.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export const challengeService = {
  /**
   * Gets current week start date string (YYYY-MM-DD)
   */
  getCurrentWeekStart() {
    return getMonday()
  },

  /**
   * Fetches weekly challenge progress for a user
   * @param {string} userId 
   */
  async getWeeklyChallenges(userId) {
    if (!userId) return WEEKLY_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false }))
    const weekStart = this.getCurrentWeekStart()

    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)

      if (error) {
        console.error('[ChallengeService] Error fetching challenge progress:', error.message)
      }

      const progressMap = new Map((data || []).map(row => [row.challenge_id, row]))

      return WEEKLY_CHALLENGES.map(challenge => {
        const row = progressMap.get(challenge.id)
        return {
          ...challenge,
          progress: row ? row.progress : 0,
          completed: row ? row.completed : false
        }
      })
    } catch (err) {
      console.warn('[ChallengeService] Exception fetching challenges:', err)
      return WEEKLY_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false }))
    }
  },

  /**
   * Increments progress for challenges matching a specific action type
   * @param {string} userId 
   * @param {string} type 'episodes' | 'ratings' | 'completions' | 'additions'
   * @param {number} amount 
   */
  async incrementProgress(userId, type, amount = 1) {
    if (!userId || !type || amount <= 0) return

    const weekStart = this.getCurrentWeekStart()
    const matchingChallenges = WEEKLY_CHALLENGES.filter(c => c.type === type)
    if (matchingChallenges.length === 0) return

    try {
      const currentChallenges = await this.getWeeklyChallenges(userId)
      const currentMap = new Map(currentChallenges.map(c => [c.id, c]))

      for (const challenge of matchingChallenges) {
        const current = currentMap.get(challenge.id)
        if (!current || current.completed) continue

        const newProgress = Math.min(challenge.target, current.progress + amount)
        const isNowCompleted = newProgress >= challenge.target

        const { error } = await supabase
          .from('user_challenge_progress')
          .upsert({
            user_id: userId,
            challenge_id: challenge.id,
            week_start: weekStart,
            progress: newProgress,
            completed: isNowCompleted,
            updated_at: new Date().toISOString()
          })

        if (!error && isNowCompleted && !current.completed) {
          // Challenge completed! Award XP and notify
          trackChallengeCompleted(challenge.id, challenge.title)
          await xpService.awardXP(userId, challenge.xpReward || 'challenge_completed', { challengeId: challenge.id })
          await notificationService.createNotification(
            userId,
            'challenge',
            `Challenge Completed: ${challenge.title}!`,
            `You earned +${challenge.xpReward} XP.`,
            { challengeId: challenge.id, xp: challenge.xpReward }
          )
        }
      }
    } catch (err) {
      console.error('[ChallengeService] Error incrementing progress:', err)
    }
  }
}

export default challengeService
