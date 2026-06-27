import { useState, useEffect, useCallback } from 'react'
import { challengeService } from '../services/challengeService'

export function useChallenges(userId) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(!!userId)

  const fetchChallenges = useCallback(async () => {
    if (!userId) {
      setChallenges([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await challengeService.getWeeklyChallenges(userId)
      setChallenges(data)
    } catch (err) {
      console.error('[useChallenges] Error fetching challenges:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const completedCount = challenges.filter(c => c.completed).length

  return {
    challenges,
    completedCount,
    totalCount: challenges.length,
    loading,
    refetch: fetchChallenges
  }
}

export default useChallenges
