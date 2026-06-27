const BASE_URL = 'https://api.jikan.moe/v4'

/**
 * AI Recommendation Engine
 * 
 * Future LLM Integration:
 * This can be replaced by an API call to a vector database (Pinecone/Weaviate) 
 * embedded with anime synopses, queried via an LLM. 
 * For now, it uses heuristic matching against Jikan's API and user profile data.
 */

// Helper to check if an anime is in the user's progress list (tracked/dropped/completed)
function isTracked(animeId, progressList) {
  if (!progressList || progressList.length === 0) return false
  return progressList.some(p => p.anime_id === animeId)
}

export const recommendationEngine = {
  
  /**
   * Generates a "Based On Your Taste" feed.
   * Pulls anime matching the user's favorite genres, sorting by score.
   */
  async getBasedOnTaste(favoriteGenres, progressList = [], limit = 15) {
    if (!favoriteGenres || favoriteGenres.length === 0) return []
    
    // Map string genres to Jikan IDs for the API
    const GENRE_MAP = {
      'action': 1, 'adventure': 2, 'comedy': 4, 'drama': 8, 'fantasy': 10,
      'romance': 22, 'sci-fi': 24, 'sports': 30, 'thriller': 41, 'psychological': 40,
      'slice of life': 36, 'horror': 14, 'mystery': 7, 'mecha': 18, 'isekai': 62
    }

    const genreIds = favoriteGenres
      .map(g => GENRE_MAP[g.toLowerCase()])
      .filter(id => id)
      .join(',')

    if (!genreIds) return []

    try {
      // Fetch highly rated anime in those genres
      const response = await fetch(`${BASE_URL}/anime?genres=${genreIds}&order_by=score&sort=desc&sfw=true`)
      const data = await response.json()
      
      if (!data.data) return []

      // Filter out anime the user has already seen/tracked
      const untracked = data.data.filter(anime => !isTracked(anime.mal_id, progressList))
      
      return untracked.slice(0, limit)
    } catch (err) {
      console.error('[RecommendationEngine] Failed to get based on taste:', err)
      return []
    }
  },

  /**
   * Generates "Hidden Gems / Underrated Picks".
   * Finds anime with a high score (>8) but low popularity rank (>1500).
   */
  async getHiddenGems(progressList = [], limit = 15) {
    try {
      // Jikan doesn't allow filtering strictly by popularity range easily in one call,
      // but we can search for high score and then filter locally, or just fetch a random page of good anime.
      // For heuristics, we'll fetch highly rated anime from a random page (page 5-10) to find less mainstream ones.
      const randomPage = Math.floor(Math.random() * 5) + 5
      const response = await fetch(`${BASE_URL}/anime?min_score=7.5&order_by=score&sort=desc&page=${randomPage}&sfw=true`)
      const data = await response.json()

      if (!data.data) return []

      // Filter untracked AND ensure members count is relatively low (heuristic for hidden gem)
      const gems = data.data.filter(anime => 
        !isTracked(anime.mal_id, progressList) && anime.members < 300000
      )

      return gems.slice(0, limit)
    } catch (err) {
      console.error('[RecommendationEngine] Failed to get hidden gems:', err)
      return []
    }
  },

  /**
   * Recommends similar anime based on a specific anime ID.
   */
  async getSimilarAnime(animeId, progressList = [], limit = 10) {
    try {
      const response = await fetch(`${BASE_URL}/anime/${animeId}/recommendations`)
      const data = await response.json()
      
      if (!data.data) return []

      const untracked = data.data
        .map(rec => rec.entry)
        .filter(anime => !isTracked(anime.mal_id, progressList))
      
      return untracked.slice(0, limit)
    } catch (err) {
      console.error('[RecommendationEngine] Failed to get similar anime:', err)
      return []
    }
  }
}
