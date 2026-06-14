import { trackApiPerformance } from './analyticsService.js'

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
   * Helper fetcher with cache, request deduplication, timeout, cancellation and retry handling.
   */
  async _fetch(cacheKey, endpoint, options = {}) {
    const { signal, timeout = 10000 } = options

    const cachedData = getFromCache(cacheKey)
    if (cachedData) return cachedData

    // Offline check: throw early to avoid long timeout if cache is empty (only in browser)
    const isBrowser = typeof window !== 'undefined'
    if (isBrowser && typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('Anime data is temporarily unavailable. (Offline)')
    }

    let sharedRequest = pendingRequests.get(cacheKey)
    if (!sharedRequest) {
      sharedRequest = (async () => {
        let lastStatus = null

        for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeout)

          try {
            const startTime = Date.now()
            const response = await fetch(`${BASE_URL}${endpoint}`, {
              signal: controller.signal
            })
            const duration = Date.now() - startTime
            lastStatus = response.status

            trackApiPerformance('Jikan API', endpoint, duration, response.ok ? 'success' : 'failure')

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
            if (error.name === 'AbortError') {
              throw new Error('Anime data is temporarily unavailable. (Timeout)', { cause: error })
            }

            const isFriendlyError =
              error.message === getFriendlyError(lastStatus) ||
              error.message.includes('temporarily unavailable')

            if (isFriendlyError) {
              throw error
            }

            if (attempt < RETRY_DELAYS.length) {
              await wait(RETRY_DELAYS[attempt])
              continue
            }

            throw new Error('Anime data is temporarily unavailable.', { cause: error })
          } finally {
            clearTimeout(timeoutId)
          }
        }
      })()

      pendingRequests.set(cacheKey, sharedRequest)
    }

    try {
      if (signal) {
        if (signal.aborted) {
          throw new DOMException('The user aborted a request.', 'AbortError')
        }
        return await new Promise((resolve, reject) => {
          const onAbort = () => {
            reject(new DOMException('The user aborted a request.', 'AbortError'))
          }
          signal.addEventListener('abort', onAbort)
          sharedRequest
            .then(resolve)
            .catch(reject)
            .finally(() => {
              signal.removeEventListener('abort', onAbort)
            })
        })
      }
      return await sharedRequest
    } finally {
      pendingRequests.delete(cacheKey)
    }
  },

  /**
   * Fetches trending/popular anime
   */
  async getTrendingAnime(options) {
    const res = await this._fetch(
      'trendingAnime',
      '/top/anime?filter=bypopularity&limit=5',
      options
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top anime (by score/rank)
   */
  async getTopAnime(options) {
    const res = await this._fetch('topAnime', '/top/anime?limit=5', options)
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top airing anime
   */
  async getTopAiringAnime(options) {
    const res = await this._fetch(
      'topAiringAnime',
      '/top/anime?filter=airing&limit=5',
      options
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches top anime movies.
   */
  async getTopMovies(options) {
    const res = await this._fetch(
      'topMovies',
      '/top/anime?type=movie&limit=5',
      options
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches popular anime this week
   */
  async getPopularThisWeek(options) {
    const res = await this._fetch(
      'popularThisWeek',
      '/top/anime?filter=favorite&limit=5',
      options
    )
    return (res.data || []).map(mapJikanAnime)
  },

  /**
   * Fetches full anime details by MAL ID
   */
  async getAnimeDetails(id, options) {
    const res = await this._fetch(`animeDetails:${id}`, `/anime/${id}/full`, options)
    return mapJikanAnime(res.data)
  },

  /**
   * Fetches related anime/recommendations
   */
  async getRelatedAnime(id, options) {
    const res = await this._fetch(
      `relatedAnime:${id}`,
      `/anime/${id}/recommendations`,
      options
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
  async searchAnime(query, options) {
    const normalizedQuery = query.trim().toLowerCase()
    const res = await this._fetch(
      `search:${normalizedQuery}`,
      `/anime?q=${encodeURIComponent(normalizedQuery)}&limit=24`,
      options
    )
    return (res.data || []).map(mapJikanAnime)
  }
}
