import { useState, useEffect, useCallback } from 'react'
import { profileService } from '../services/profileService'

/**
 * Hook to fetch and cache a user's public profile.
 * @param {string|null} userId
 */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) { setProfile(null); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getProfile(userId)
      setProfile(data)
    } catch (err) {
      console.error('[useProfile] Error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}

export default useProfile
