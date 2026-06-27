/**
 * AI Explanation Generator
 * 
 * Future LLM Integration:
 * Send the Anime metadata and User Profile to an LLM to generate a natural, 
 * conversational explanation. 
 * Current implementation uses deterministic heuristics.
 */

export const explanationGenerator = {
  /**
   * Generates a concise explanation for a recommendation.
   * @param {Object} anime - The Jikan anime object
   * @param {Object} context - { favoriteGenres: string[], previousAnimeId: number, contextType: string }
   * @returns {string}
   */
  generate(anime, context = {}) {
    const { favoriteGenres = [], contextType = 'general' } = context

    if (contextType === 'taste' && favoriteGenres.length > 0) {
      // Find intersection of anime genres and user's favorite genres
      const animeGenres = anime.genres ? anime.genres.map(g => g.name.toLowerCase()) : []
      const matched = favoriteGenres.filter(g => animeGenres.includes(g.toLowerCase()))
      
      if (matched.length > 0) {
        return `Recommended because you enjoy ${matched[0]} anime.`
      }
      return 'Matches your favorite genres.'
    }

    if (contextType === 'hidden_gem') {
      return 'Highly rated by critics, but undiscovered by the mainstream.'
    }

    if (contextType === 'similar') {
      return 'Similar to what you recently watched.'
    }

    if (contextType === 'trending') {
      return 'Currently popular among the AnimeLoom community.'
    }

    // Fallback
    if (anime.score > 8.5) {
      return 'Critically acclaimed masterpiece.'
    }
    
    return 'We think you might like this.'
  }
}
