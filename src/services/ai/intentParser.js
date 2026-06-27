/**
 * AI Intent Parser
 * 
 * Future LLM Integration:
 * Replace this entire heuristic parser with a call to an LLM (e.g., Gemini/GPT-4o).
 * Prompt the LLM with: "Extract intent from the following search query. Return JSON
 * containing 'query' (string), 'genres' (array), 'minScore' (number), 'maxEpisodes' (number),
 * and 'status' (string). Query: {userQuery}"
 */

const GENRE_MAP = {
  'action': 1,
  'adventure': 2,
  'comedy': 4,
  'drama': 8,
  'fantasy': 10,
  'romance': 22,
  'sci-fi': 24,
  'scifi': 24,
  'sports': 30,
  'thriller': 41,
  'psychological': 40,
  'slice of life': 36,
  'horror': 14,
  'mystery': 7,
  'mecha': 18,
  'isekai': 62
}

/**
 * Parses natural language search into Jikan API filters.
 * @param {string} rawQuery 
 * @returns {Object} { query: string, filters: { genres: string, min_score: number, max_episodes: number } }
 */
export async function parseSearchIntent(rawQuery) {
  const query = rawQuery.toLowerCase()
  
  const parsed = {
    original: rawQuery,
    cleanQuery: rawQuery,
    filters: {}
  }

  // 1. Extract Genres
  const foundGenres = []
  for (const [genre, id] of Object.entries(GENRE_MAP)) {
    if (query.includes(genre)) {
      foundGenres.push(id)
      parsed.cleanQuery = parsed.cleanQuery.replace(new RegExp(`\\b${genre}\\b`, 'gi'), '').trim()
    }
  }
  if (foundGenres.length > 0) {
    parsed.filters.genres = foundGenres.join(',')
  }

  // 2. Extract Length Constraints
  if (query.match(/\bshort\b/i) || query.match(/\b(under|less than) 20\b/i)) {
    parsed.filters.max_episodes = 13
    parsed.cleanQuery = parsed.cleanQuery.replace(/\bshort\b/gi, '').replace(/\b(under|less than) 20\b/gi, '').trim()
  } else if (query.match(/\blong\b/i) || query.match(/\bover 50\b/i)) {
    parsed.filters.min_episodes = 50
    parsed.cleanQuery = parsed.cleanQuery.replace(/\blong\b/gi, '').replace(/\bover 50\b/gi, '').trim()
  }

  // 3. Extract Sentiment / Score
  if (query.match(/\b(best|masterpiece|amazing|highly rated|top)\b/i)) {
    parsed.filters.min_score = 8
    parsed.cleanQuery = parsed.cleanQuery.replace(/\b(best|masterpiece|amazing|highly rated|top)\b/gi, '').trim()
  } else if (query.match(/\b(good)\b/i)) {
    parsed.filters.min_score = 7
    parsed.cleanQuery = parsed.cleanQuery.replace(/\b(good)\b/gi, '').trim()
  }

  // Clean up extra spaces or artifacts from removing keywords
  parsed.cleanQuery = parsed.cleanQuery.replace(/\s+/g, ' ').replace(/^(anime|show|series) (like|with)/i, '').trim()
  
  if (parsed.cleanQuery === 'anime' || parsed.cleanQuery === 'series') {
    parsed.cleanQuery = ''
  }

  return parsed
}
