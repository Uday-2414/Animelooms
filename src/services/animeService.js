// Centralized Service Layer for Jikan API v4 (MyAnimeList)
const BASE_URL = 'https://api.jikan.moe/v4'

// Simple in-memory cache to prevent duplicate requests and 429 Rate Limits
const cache = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes TTL

function getFromCache(key) {
  const entry = cache[key]
  if (entry && (Date.now() - entry.timestamp < CACHE_DURATION)) {
    return entry.data
  }
  return null
}

function setToCache(key, data) {
  cache[key] = {
    data,
    timestamp: Date.now()
  }
}

/**
 * Adapter mapping Jikan's raw API schema into our clean UI model
 */
function mapJikanAnime(raw) {
  if (!raw) return null
  return {
    mal_id: raw.mal_id,
    title: raw.title_english || raw.title,
    japanese_title: raw.title_japanese,
    image_url: raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url,
    score: raw.score,
    genres: raw.genres ? raw.genres.map(g => g.name) : [],
    type: raw.type,
    episodes: raw.episodes,
    status: raw.status,
    release_year: raw.year || raw.aired?.prop?.from?.year || null,
    synopsis: raw.synopsis,
    trailer_url: raw.trailer?.embed_url
  }
}

export const animeService = {
  /**
   * Helper fetcher with retries and rate limit checks
   */
  async _fetch(endpoint, retries = 2, delay = 1000) {
    const cacheKey = endpoint
    const cachedData = getFromCache(cacheKey)
    if (cachedData) return cachedData

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`)
        
        if (response.status === 429) {
          if (attempt < retries) {
            console.warn(`Jikan API 429 rate limit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
          throw new Error('API Rate limit exceeded. Please wait a moment.')
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const json = await response.json()
        setToCache(cacheKey, json)
        return json
      } catch (error) {
        if (attempt === retries) {
          console.error(`Error fetching from Jikan endpoint [${endpoint}]:`, error)
          throw error
        }
        console.warn(`Fetch error occurred. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  },

  /**
   * Fetches trending/popular anime
   */
  async getTrendingAnime() {
    const res = await this._fetch('/top/anime?filter=bypopularity&limit=5')
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top anime (by score/rank)
   */
  async getTopAnime() {
    const res = await this._fetch('/top/anime?limit=5')
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top airing anime
   */
  async getTopAiringAnime() {
    const res = await this._fetch('/top/anime?filter=airing&limit=5')
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches popular anime this week
   */
  async getPopularThisWeek() {
    const res = await this._fetch('/top/anime?filter=favorite&limit=5')
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches full anime details by MAL ID
   */
  async getAnimeDetails(id) {
    const res = await this._fetch(`/anime/${id}/full`)
    return mapJikanAnime(res.data)
  },

  /**
   * Fetches related anime/recommendations
   */
  async getRelatedAnime(id) {
    const res = await this._fetch(`/anime/${id}/recommendations`)
    return (res.data || []).slice(0, 5).map(rec => ({
      mal_id: rec.entry.mal_id,
      title: rec.entry.title,
      image_url: rec.entry.images?.jpg?.large_image_url || rec.entry.images?.jpg?.image_url,
      score: null,
      genres: []
    }))
  },

  /**
   * Searches for anime by query
   */
  async searchAnime(query) {
    const res = await this._fetch(`/anime?q=${encodeURIComponent(query)}&limit=24`)
    return (res.data || []).map(mapJikanAnime)
  }
}
