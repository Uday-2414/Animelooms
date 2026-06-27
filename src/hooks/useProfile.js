import { useState, useEffect, useCallback } from 'react'
import { profileService } from '../services/profileService'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await profileService.getProfile(userId)
      setProfile(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refresh: fetchProfile, setProfile }
}
