import { useState, useEffect, useCallback } from 'react'
import { activityService } from '../services/activityService'

/**
 * Hook to fetch community-wide activity feed.
 * @param {number} limit
 */
export function useCommunityActivity(limit = 20) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await activityService.getRecentCommunityActivity(limit)
      setActivity(data)
    } catch (err) {
      console.error('[useCommunityActivity] Error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { fetch() }, [fetch])

  return { activity, loading, error, refetch: fetch }
}

/**
 * Hook to fetch a specific user's activity.
 * @param {string|null} userId
 * @param {number} limit
 */
export function useUserActivity(userId, limit = 10) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(!!userId)

  useEffect(() => {
    if (!userId) { setActivity([]); setLoading(false); return }
    let isMounted = true
    setLoading(true)
    activityService.getUserActivity(userId, limit).then(data => {
      if (isMounted) { setActivity(data); setLoading(false) }
    }).catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [userId, limit])

  return { activity, loading }
}

export default useCommunityActivity
