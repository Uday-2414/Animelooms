/**
 * Modular AI Provider Adapter Interface (Module 12: Future AI Readiness)
 * Standardizes recommendation algorithms, vector search embeddings, and intent parsing
 * to allow seamless plug-and-play with external LLM services or pgvector databases.
 */

export const aiProvider = {
  name: 'AnimeLoom Local Heuristic Engine v2.0',

  /**
   * Evaluates recommendation candidate scoring
   * @param {Object} candidate - Anime item metadata
   * @param {Object} userProfile - User history and preferences context
   */
  scoreCandidate(candidate, userProfile) {
    if (!candidate || !userProfile) return { score: 0, reason: '' }

    let score = 0
    const reasons = []

    const { favoriteGenres = [], completedTitles = [], userRatings = {}, averageScore = 7.5 } = userProfile

    // 1. Genre Affinity Match (Weight: 30%)
    if (candidate.genres && favoriteGenres.length > 0) {
      const matchingGenres = candidate.genres.filter(g => favoriteGenres.includes(g))
      if (matchingGenres.length > 0) {
        score += matchingGenres.length * 15
        reasons.push(`matches your love for ${matchingGenres.join(' & ')}`)
      }
    }

    // 2. High MAL Rating / Popularity (Weight: 20%)
    if (candidate.score && candidate.score >= 8.0) {
      score += (candidate.score - 7) * 10
      reasons.push(`rated ${candidate.score}/10 by the global community`)
    }

    // 3. Status or Theme Match (Weight: 15%)
    if (completedTitles.length > 0 && candidate.type === 'TV') {
      score += 10
    }

    // Generate human-friendly explanation string
    let explanation = 'Recommended based on overall community popularity.'
    if (reasons.length > 0) {
      explanation = `Recommended because it ${reasons.join(' and ')}.`
    }

    return {
      score: Math.min(100, Math.round(score)),
      reason: explanation
    }
  },

  /**
   * Future Vector Search Adapter stub
   * Returns empty array by default until embedding endpoint is configured
   */
  async queryVectorEmbeddings(queryVector, limit = 10) {
    console.info('[AIProvider] Vector embedding search stub called. Ready for future pgvector backend.')
    return []
  }
}

export default aiProvider
