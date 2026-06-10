// Centralized Service Layer for Jikan API v4 (MyAnimeList)
const BASE_URL = 'https://api.jikan.moe/v4'

const CACHE_TTL = 15 * 60 * 1000
const RETRY_DELAYS = [1000, 2000]
const isDevelopment = import.meta.env.DEV

const cache = new Map()
const pendingRequests = new Map()

function logCache(message, key) {
  if (isDevelopment) {
    console.info(`[AnimeLoom API] ${message}: ${key}`)
  }
}

function getFromCache(key) {
  const entry = cache.get(key)

  if (!entry) {
    logCache('Cache Miss', key)
    return null
  }

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    logCache('Cache Miss', key)
    return null
  }

  logCache('Cache Hit', key)
  return entry.data
}

function setToCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getFriendlyError(status) {
  if (status === 429) {
    return 'Anime data is temporarily busy. Please wait a moment and try again.'
  }

  return 'Unable to load anime data. Please try again.'
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
   * Helper fetcher with cache, request deduplication, and retry handling.
   */
  async _fetch(cacheKey, endpoint) {
    const cachedData = getFromCache(cacheKey)
    if (cachedData) return cachedData

    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)
    }

    const request = (async () => {
      let lastStatus = null

      for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`)
          lastStatus = response.status

          if (response.ok) {
            const json = await response.json()
            setToCache(cacheKey, json)
            return json
          }

          const shouldRetry =
            response.status === 429 || response.status >= 500

          if (!shouldRetry) {
            throw new Error(getFriendlyError(response.status))
          }

          if (attempt < RETRY_DELAYS.length) {
            await wait(RETRY_DELAYS[attempt])
            continue
          }

          throw new Error(getFriendlyError(response.status))
        } catch (error) {
          const isFriendlyError =
            error.message === getFriendlyError(lastStatus)

          if (isFriendlyError) {
            throw error
          }

          if (attempt < RETRY_DELAYS.length) {
            await wait(RETRY_DELAYS[attempt])
            continue
          }

          throw new Error(getFriendlyError(lastStatus), { cause: error })
        }
      }
    })()

    pendingRequests.set(cacheKey, request)

    try {
      return await request
    } finally {
      pendingRequests.delete(cacheKey)
    }
  },

  /**
   * Fetches trending/popular anime
   */
  async getTrendingAnime() {
    const res = await this._fetch(
      'trendingAnime',
      '/top/anime?filter=bypopularity&limit=5'
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top anime (by score/rank)
   */
  async getTopAnime() {
    const res = await this._fetch('topAnime', '/top/anime?limit=5')
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top airing anime
   */
  async getTopAiringAnime() {
    const res = await this._fetch(
      'topAiringAnime',
      '/top/anime?filter=airing&limit=5'
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top anime movies.
   */
  async getTopMovies() {
    const res = await this._fetch(
      'topMovies',
      '/top/anime?type=movie&limit=5'
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches popular anime this week
   */
  async getPopularThisWeek() {
    const res = await this._fetch(
      'popularThisWeek',
      '/top/anime?filter=favorite&limit=5'
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches full anime details by MAL ID
   */
  async getAnimeDetails(id) {
    const res = await this._fetch(`animeDetails:${id}`, `/anime/${id}/full`)
    return mapJikanAnime(res.data)
  },

  /**
   * Fetches related anime/recommendations
   */
  async getRelatedAnime(id) {
    const res = await this._fetch(
      `relatedAnime:${id}`,
      `/anime/${id}/recommendations`
    )
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
    const normalizedQuery = query.trim().toLowerCase()
    const res = await this._fetch(
      `search:${normalizedQuery}`,
      `/anime?q=${encodeURIComponent(normalizedQuery)}&limit=24`
    )
    return (res.data || []).map(mapJikanAnime)
  }
}
