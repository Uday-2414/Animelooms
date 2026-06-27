import { useState, useEffect, useCallback } from 'react'
import { socialService } from '../services/socialService'

export function useFollowStats(userId) {
  const [stats, setStats] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats({ followers: 0, following: 0 })
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const data = await socialService.getFollowStats(userId)
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch follow stats', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refresh: fetchStats }
}

export function useIsFollowing(followerId, followingId) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkStatus = useCallback(async () => {
    if (!followerId || !followingId) {
      setIsFollowing(false)
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const status = await socialService.isFollowing(followerId, followingId)
      setIsFollowing(status)
    } catch (err) {
      console.error('Failed to check follow status', err)
    } finally {
      setLoading(false)
    }
  }, [followerId, followingId])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return { isFollowing, loading, refresh: checkStatus, setIsFollowing }
}
