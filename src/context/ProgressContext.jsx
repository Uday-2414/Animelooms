import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { progressService } from '../services/progressService'
import AuthContext from './AuthContext'

const ProgressContext = createContext({
  progressList: [],
  loading: true,
  error: null,
  addProgress: async () => {},
  updateProgress: async () => {},
  deleteProgress: async () => {},
  getProgressForAnime: () => null,
  refreshProgress: async () => {},
})

export function ProgressProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(!!user)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgressList([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await progressService.getProgress(user.id)
      setProgressList(data || [])
    } catch (err) {
      console.error('[ProgressContext] Error fetching progress:', err)
      setError('Unable to sync progress data.')
      setProgressList([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const addProgress = useCallback(async (anime, status) => {
    if (!user) throw new Error('Must be logged in to track anime.')
    const newItem = await progressService.addProgress(user.id, anime, status)
    setProgressList(prev => [newItem, ...prev.filter(i => i.anime_id !== newItem.anime_id)])
    return newItem
  }, [user])

  const updateProgress = useCallback(async (animeId, fields) => {
    if (!user) throw new Error('Must be logged in to update progress.')
    const updated = await progressService.updateProgress(user.id, animeId, fields)
    setProgressList(prev => prev.map(item => item.anime_id === Number(animeId) ? updated : item))
    return updated
  }, [user])

  const deleteProgress = useCallback(async (animeId) => {
    if (!user) throw new Error('Must be logged in to remove tracker.')
    await progressService.deleteProgress(user.id, animeId)
    setProgressList(prev => prev.filter(item => item.anime_id !== Number(animeId)))
  }, [user])

  const getProgressForAnime = useCallback((animeId) => {
    if (!animeId) return null
    return progressList.find(item => item.anime_id === Number(animeId)) || null
  }, [progressList])

  return (
    <ProgressContext.Provider
      value={{
        progressList,
        loading,
        error,
        addProgress,
        updateProgress,
        deleteProgress,
        getProgressForAnime,
        refreshProgress: fetchProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}

export default ProgressContext
