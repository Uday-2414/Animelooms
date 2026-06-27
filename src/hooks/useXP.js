import { useState, useEffect, useCallback } from 'react'
import { xpService } from '../services/xpService'

export function useXP(userId) {
  const [levelInfo, setLevelInfo] = useState(null)
  const [loading, setLoading] = useState(!!userId)

  const fetchXP = useCallback(async () => {
    if (!userId) {
      setLevelInfo(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await xpService.getXP(userId)
      setLevelInfo(data)
    } catch (err) {
      console.error('[useXP] Error fetching XP:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchXP()
  }, [fetchXP])

  return {
    ...levelInfo,
    levelInfo,
    loading,
    refetch: fetchXP
  }
}

export default useXP
