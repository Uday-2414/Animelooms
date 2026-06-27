import { useState, useEffect, useCallback } from 'react'
import { badgeService } from '../services/badgeService'

export function useBadges(userId) {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(!!userId)

  const fetchBadges = useCallback(async () => {
    if (!userId) {
      setBadges([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await badgeService.getEarnedBadges(userId)
      setBadges(data)
    } catch (err) {
      console.error('[useBadges] Error fetching badges:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  return {
    badges,
    loading,
    refetch: fetchBadges
  }
}

export default useBadges
