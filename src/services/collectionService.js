import { supabase } from './supabaseClient'
import { activityService, ACTIVITY_TYPES } from './activityService'

export const collectionService = {
  /**
   * Fetches a single collection with its items and creator profile.
   */
  async getCollection(collectionId) {
    if (!collectionId) return null

    const { data, error } = await supabase
      .from('anime_collections')
      .select(`
        *,
        profiles:user_id ( id, username, display_name, avatar_url ),
        items:collection_items ( * )
      `)
      .eq('id', collectionId)
      .single()

    if (error) {
      console.error('[CollectionService] Error fetching collection:', error.message)
      return null
    }

    // Sort items by sort_order
    if (data && data.items) {
      data.items.sort((a, b) => a.sort_order - b.sort_order)
    }

    return data
  },

  /**
   * Fetches all collections for a specific user.
   */
  async getUserCollections(userId) {
    if (!userId) return []

    const { data, error } = await supabase
      .from('anime_collections')
      .select(`
        *,
        items:collection_items ( anime_image )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[CollectionService] Error fetching user collections:', error.message)
      return []
    }

    return data || []
  },

  /**
   * Fetches public collections for the Discover page.
   */
  async getDiscoverCollections(limit = 10, sortBy = 'likes_count') {
    const { data, error } = await supabase
      .from('anime_collections')
      .select(`
        *,
        profiles:user_id ( id, username, display_name, avatar_url ),
        items:collection_items ( anime_image )
      `)
      .eq('is_public', true)
      .order(sortBy, { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[CollectionService] Error fetching discover collections:', error.message)
      return []
    }

    return data || []
  },

  /**
   * Creates a new collection.
   */
  async createCollection(userId, payload) {
    if (!userId) throw new Error('User required to create collection')

    const { data, error } = await supabase
      .from('anime_collections')
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description || '',
        is_public: payload.is_public !== false,
      })
      .select()
      .single()

    if (error) throw error

    // Fire & forget activity log
    activityService.logActivity(userId, 'created_collection', null, data.title, null, { collection_id: data.id })

    return data
  },

  /**
   * Updates an existing collection.
   */
  async updateCollection(collectionId, payload) {
    if (!collectionId) return null

    const { data, error } = await supabase
      .from('anime_collections')
      .update(payload)
      .eq('id', collectionId)
      .select()
      .single()

    if (error) throw error

    return data
  },

  /**
   * Deletes a collection.
   */
  async deleteCollection(collectionId) {
    if (!collectionId) return false
    const { error } = await supabase.from('anime_collections').delete().eq('id', collectionId)
    if (error) throw error
    return true
  },

  /**
   * Adds an anime to a collection.
   */
  async addAnimeToCollection(collectionId, animeId, animeTitle, animeImage) {
    if (!collectionId || !animeId) return false

    // Get current count for sort order
    const { count } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId)

    const { error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        anime_id: animeId,
        anime_title: animeTitle,
        anime_image: animeImage,
        sort_order: count || 0
      })

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation (already in collection)
        return false
      }
      throw error
    }

    return true
  },

  /**
   * Removes an anime from a collection.
   */
  async removeAnimeFromCollection(collectionId, animeId) {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .match({ collection_id: collectionId, anime_id: animeId })

    if (error) throw error
    return true
  }
}

export default collectionService
