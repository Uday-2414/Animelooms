/**
 * Module 2 & 9: Natural Language Search Intent Parser & Search History Manager
 */

const HISTORY_KEY = 'animeloom_search_history_v2'
const MAX_HISTORY = 8

export const aiSearchService = {
  /**
   * Module 2: Natural Language Intent Parser
   * Parses queries like "Sad anime under 12 episodes" or "Dark psychological anime"
   * @param {string} rawQuery 
   */
  parseIntent(rawQuery) {
    if (!rawQuery || typeof rawQuery !== 'string') {
      return { cleanQuery: '', filters: {}, detectedIntents: [] }
    }

    const query = rawQuery.trim().toLowerCase()
    const filters = {}
    const detectedIntents = []

    // 1. Detect Episode Count Constraints (e.g. "under 12 episodes", "short anime")
    const underEpMatch = query.match(/(?:under|less than|max|<=?)\s*(\d+)\s*(?:episodes|eps|ep)?/)
    if (underEpMatch) {
      const maxEp = parseInt(underEpMatch[1], 10)
      filters.maxEpisodes = maxEp
      detectedIntents.push(`Max ${maxEp} Episodes`)
    } else if (query.includes('short')) {
      filters.maxEpisodes = 13
      detectedIntents.push('Short Series (<=13 episodes)')
    } else if (query.includes('long') || query.includes('movie')) {
      if (query.includes('movie')) {
        filters.type = 'movie'
        detectedIntents.push('Movie Format')
      }
    }

    // 2. Detect Emotional & Genre Intents
    if (query.includes('sad') || query.includes('cry') || query.includes('emotional')) {
      filters.genre = 'Drama'
      detectedIntents.push('Emotional / Drama')
    }
    if (query.includes('dark') || query.includes('psychological') || query.includes('thriller')) {
      filters.genre = 'Psychological'
      detectedIntents.push('Dark / Psychological Thriller')
    }
    if (query.includes('romance') || query.includes('romantic') || query.includes('love')) {
      filters.genre = 'Romance'
      detectedIntents.push('Romance')
    }
    if (query.includes('comedy') || query.includes('funny') || query.includes('laugh')) {
      filters.genre = 'Comedy'
      detectedIntents.push('Comedy')
    }
    if (query.includes('action') || query.includes('fight') || query.includes('battle')) {
      filters.genre = 'Action'
      detectedIntents.push('High Octane Action')
    }

    // 3. Clean query terms by stripping intent stop words
    let cleanQuery = query
      .replace(/(?:under|less than|max|<=?)\s*\d+\s*(?:episodes|eps|ep)?/gi, '')
      .replace(/\b(sad|dark|psychological|short|anime|best|top|similar|to|with|happy|ending)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanQuery) {
      cleanQuery = rawQuery.trim()
    }

    return {
      rawQuery,
      cleanQuery,
      filters,
      detectedIntents
    }
  },

  /**
   * Module 9: Search History Management (localStorage)
   */
  getRecentSearches() {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      return []
    }
  },

  addSearchHistory(query) {
    if (!query || query.trim().length < 2) return
    try {
      const current = this.getRecentSearches()
      const cleaned = query.trim()
      const filtered = current.filter(q => q.toLowerCase() !== cleaned.toLowerCase())
      const updated = [cleaned, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('[AISearchService] Failed to save search history', e)
    }
  },

  clearSearchHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch (e) {}
  },

  getPopularSearches() {
    return [
      'Attack on Titan',
      'Demon Slayer',
      'Jujutsu Kaisen',
      'Solo Leveling',
      'Dark Psychological Thriller',
      'Sad anime under 12 episodes',
      'Short romance anime'
    ]
  }
}

export default aiSearchService
