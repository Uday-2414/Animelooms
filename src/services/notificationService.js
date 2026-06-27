import { supabase } from './supabaseClient'

export const notificationService = {
  /**
   * Fetches recent notifications for a user
   * @param {string} userId 
   * @param {number} limit 
   */
  async getNotifications(userId, limit = 20) {
    if (!userId) return []
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
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
   * @param {string} userId 
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
   * @param {string} userId 
   * @param {string} notificationId 
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
   * @param {string} userId 
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
   * Creates an in-app notification
   * @param {string} userId 
   * @param {string} type 'achievement' | 'level_up' | 'challenge' | 'streak'
   * @param {string} title 
   * @param {string} body 
   * @param {Object} metadata 
   */
  async createNotification(userId, type, title, body = '', metadata = {}) {
    if (!userId || !title) return null
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          body,
          metadata,
          is_read: false
        })
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
  }
}

export default notificationService
