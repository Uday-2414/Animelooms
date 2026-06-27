import { supabase } from './supabaseClient'
import { notificationService } from './notificationService'

export const socialService = {
  /**
   * Follows a user and creates a notification.
   */
  async followUser(followerId, followingId) {
    if (!followerId || !followingId || followerId === followingId) return false

    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })

    if (error) {
      if (error.code === '23505') return true // Already following
      console.error('[SocialService] Error following user:', error.message)
      throw error
    }

    // Fire & forget notification
    notificationService.createNotification(
      followingId,
      followerId,
      'follow',
      null
    ).catch(e => console.warn('Failed to send follow notification', e))

    return true
  },

  /**
   * Unfollows a user.
   */
  async unfollowUser(followerId, followingId) {
    if (!followerId || !followingId) return false

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .match({ follower_id: followerId, following_id: followingId })

    if (error) {
      console.error('[SocialService] Error unfollowing user:', error.message)
      throw error
    }

    return true
  },

  /**
   * Checks if current user is following the target user.
   */
  async checkIsFollowing(followerId, followingId) {
    if (!followerId || !followingId) return false

    const { data, error } = await supabase
      .from('user_follows')
      .select('created_at')
      .match({ follower_id: followerId, following_id: followingId })
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[SocialService] Error checking follow status:', error.message)
    }

    return !!data
  },

  /**
   * Gets follower count for a user.
   */
  async getFollowerCount(userId) {
    const { count, error } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    if (error) return 0
    return count || 0
  },

  /**
   * Gets following count for a user.
   */
  async getFollowingCount(userId) {
    const { count, error } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (error) return 0
    return count || 0
  },

  /**
   * Searches for public users by username or display name.
   */
  async searchUsers(query, limit = 10) {
    if (!query || query.trim().length < 2) return []

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url, bio')
      .eq('is_public', true)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error('[SocialService] Error searching users:', error.message)
      return []
    }

    return data || []
  }
}

export default socialService
