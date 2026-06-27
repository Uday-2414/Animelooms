import { useState, useEffect, useCallback } from 'react'
import { achievementService } from '../services/achievementService'
import { ACHIEVEMENTS } from '../config/achievementConfig'

export function useAchievements(userId) {
  const [unlocked, setUnlocked] = useState([])
  const [loading, setLoading] = useState(!!userId)

  const fetchAchievements = useCallback(async () => {
    if (!userId) {
      setUnlocked([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await achievementService.getUnlockedAchievements(userId)
      setUnlocked(data)
    } catch (err) {
      console.error('[useAchievements] Error fetching achievements:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const unlockedMap = new Map((unlocked || []).map(a => [a.achievement_id || a.id, a]))

  const allAchievements = ACHIEVEMENTS.map(config => {
    const isUnlocked = unlockedMap.has(config.id)
    const row = unlockedMap.get(config.id)
    return {
      ...config,
      isUnlocked,
      unlocked_at: row ? row.unlocked_at : null
    }
  })

  return {
    unlocked,
    allAchievements,
    loading,
    refetch: fetchAchievements
  }
}

export default useAchievements
