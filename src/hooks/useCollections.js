import { useState, useEffect, useCallback } from 'react'
import { collectionService } from '../services/collectionService'

export function useUserCollections(userId) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCollections = useCallback(async () => {
    if (!userId) {
      setCollections([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await collectionService.getUserCollections(userId)
      setCollections(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  return { collections, loading, error, refresh: fetchCollections }
}

export function usePublicCollections(limit = 10) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const data = await collectionService.getPublicCollections(limit)
      setCollections(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  return { collections, loading, error, refresh: fetchCollections }
}

export function useCollectionDetails(collectionId) {
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCollection = useCallback(async () => {
    if (!collectionId) return
    setLoading(true)
    try {
      const data = await collectionService.getCollection(collectionId)
      setCollection(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [collectionId])

  useEffect(() => {
    fetchCollection()
  }, [fetchCollection])

  return { collection, loading, error, refresh: fetchCollection, setCollection }
}
