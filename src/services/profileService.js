import { supabase } from './supabaseClient'

export const profileService = {
  /**
   * Fetches a public user profile by user ID.
   * Falls back gracefully if no profile row exists yet.
   */
  async getProfile(userId) {
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[ProfileService] Error fetching profile:', error.message)
    }

    return data || null
  },

  /**
   * Creates or updates a user's profile (upsert).
   */
  async upsertProfile(userId, fields) {
    if (!userId) throw new Error('Missing userId')

    const payload = {
      id: userId,
      ...fields,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('[ProfileService] Error upserting profile:', error.message)
      throw error
    }

    return data
  },

  /**
   * Ensures a profile row exists for a user. Safe to call idempotently.
   * Used on first login to bootstrap the profile.
   */
  async ensureProfile(userId, authMetadata = {}) {
    if (!userId) return null

    const existing = await this.getProfile(userId)
    if (existing) return existing

    return this.upsertProfile(userId, {
      avatar_url: authMetadata.avatar_url || authMetadata.picture || null,
      is_public: true,
    })
  },

  /**
   * Fetches complete profile data for a public profile page.
   * Joins auth user metadata for display name fallback.
   */
  async getPublicProfile(userId) {
    if (!userId) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_public', true)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[ProfileService] Error fetching public profile:', error.message)
      }
      return null
    }

    return data
  },
}

export default profileService
