import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'

export function useNotifications(userId, limit = 10) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchInitial = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(userId, limit),
        notificationService.getUnreadCount(userId)
      ])
      
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => {
    let isMounted = true
    
    fetchInitial()

    if (!userId) return

    // Subscribe to realtime updates
    const unsubscribe = notificationService.subscribeToNotifications(userId, (newNotif) => {
      if (!isMounted) return
      setNotifications(prev => [newNotif, ...prev].slice(0, limit))
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [fetchInitial, userId, limit])

  const markAllRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return
    try {
      await notificationService.markAllRead(userId)
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark notifications as read', err)
    }
  }, [userId, unreadCount])

  return { notifications, unreadCount, loading, markAllRead, refresh: fetchInitial }
}
