import { ACHIEVEMENTS } from '../config/achievementConfig'

/**
 * Evaluates which achievements a user has earned based on current context.
 * Pure synchronous function with zero network requests.
 * 
 * @param {Object} context
 * @param {Array} context.progressList
 * @param {Object} context.reviewStats { count: number, ratedCount: number }
 * @param {Object} context.streak { current: number, longest: number }
 * @returns {Array<string>} Array of achievement IDs that meet criteria
 */
export function evaluateAchievements({ progressList = [], reviewStats = { count: 0, ratedCount: 0 }, streak = { current: 0, longest: 0 } }) {
  const earnedIds = []

  const totalTracked = progressList.length
  const completedCount = progressList.filter(p => p.status === 'completed').length
  const totalEpisodesWatched = progressList.reduce((acc, p) => acc + (p.episodes_watched || 0), 0)
  const reviewsWritten = reviewStats.count || 0
  const ratingsGiven = reviewStats.ratedCount || (progressList.filter(p => p.status === 'completed' || p.episodes_watched > 0).length) // fallback
  const maxStreak = Math.max(streak.current || 0, streak.longest || 0)

  if (totalTracked >= 1) earnedIds.push('first_anime')
  if (completedCount >= 1) earnedIds.push('first_completion')
  if (reviewsWritten >= 1) earnedIds.push('first_review')
  if (ratingsGiven >= 1) earnedIds.push('first_rating')

  if (completedCount >= 10) earnedIds.push('comp_10')
  if (completedCount >= 25) earnedIds.push('comp_25')
  if (completedCount >= 50) earnedIds.push('comp_50')

  if (totalEpisodesWatched >= 100) earnedIds.push('eps_100')
  if (totalEpisodesWatched >= 500) earnedIds.push('eps_500')

  if (ratingsGiven >= 50) earnedIds.push('ratings_50')
  if (reviewsWritten >= 10) earnedIds.push('reviews_10')

  if (maxStreak >= 7) earnedIds.push('streak_7')
  if (maxStreak >= 30) earnedIds.push('streak_30')

  return earnedIds
}
