import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'
import { supabase } from '../services/supabaseClient'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(!!userId)

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [list, count] = await Promise.all([
        notificationService.getNotifications(userId, 15),
        notificationService.getUnreadCount(userId)
      ])
      setNotifications(list)
      setUnreadCount(count)
    } catch (err) {
      console.error('[useNotifications] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Realtime subscription for instant updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          setNotifications(prev => [payload.new, ...prev.slice(0, 14)])
          setUnreadCount(prev => prev + 1)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markRead = useCallback(async (id) => {
    await notificationService.markRead(userId, id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [userId])

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [userId])

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refetch: fetchAll
  }
}

export default useNotifications
