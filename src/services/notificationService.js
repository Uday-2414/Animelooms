import { supabase } from './supabaseClient'

export const notificationService = {
  /**
   * Fetches recent notifications for a user, joining actor profile data if available.
   */
  async getNotifications(userId, limit = 20) {
    if (!userId) return []
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id ( id, username, display_name, avatar_url )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[NotificationService] Error fetching notifications:', error.message)
        return []
      }
      return data || []
    } catch (err) {
      console.warn('[NotificationService] Exception in getNotifications:', err)
      return []
    }
  },

  /**
   * Fetches count of unread notifications
   */
  async getUnreadCount(userId) {
    if (!userId) return 0
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) return 0
      return count || 0
    } catch (err) {
      return 0
    }
  },

  /**
   * Marks a notification as read
   */
  async markRead(userId, notificationId) {
    if (!userId || !notificationId) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
    } catch (err) {
      console.error('[NotificationService] Error marking notification read:', err)
    }
  },

  /**
   * Marks all notifications as read for a user
   */
  async markAllRead(userId) {
    if (!userId) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
    } catch (err) {
      console.error('[NotificationService] Error marking all read:', err)
    }
  },

  /**
   * Creates an in-app notification.
   * Supports both social notifications (actor_id, reference_id) and gamification (title, body, metadata).
   */
  async createNotification(userId, actorIdOrType, typeOrTitle, referenceIdOrBody = null, metadata = {}) {
    if (!userId) return null

    // Determine signature based on Gamification (Legacy) vs Social (New)
    let payload = { user_id: userId, is_read: false }
    
    // If the 2nd arg is a UUID (actorId), it's a social notification
    if (typeof actorIdOrType === 'string' && actorIdOrType.includes('-')) {
      payload.actor_id = actorIdOrType
      payload.type = typeOrTitle
      payload.reference_id = referenceIdOrBody
    } else {
      // It's a gamification notification: (userId, type, title, body, metadata)
      payload.type = actorIdOrType
      payload.title = typeOrTitle
      payload.body = referenceIdOrBody || ''
      payload.metadata = metadata
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('[NotificationService] Error creating notification:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('[NotificationService] Exception creating notification:', err)
      return null
    }
  },

  /**
   * Subscribes to realtime notifications for a user.
   */
  subscribeToNotifications(userId, onNotificationReceived) {
    if (!userId) return null

    const subscription = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotificationReceived(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }
}

export default notificationService
