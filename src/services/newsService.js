import { trackApiPerformance } from './analyticsService'

// Centralized service layer for AnimeLoom news retrieval and caching
const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const RETRY_DELAYS = [1000, 2000]
const isDevelopment = import.meta.env?.DEV ?? false
const NEWS_CACHE_KEY = 'anime-news'

const RSS_PROXY_BASE = 'https://api.allorigins.win/raw?url='
const RSS_FEEDS = [
  {
    source: 'MyAnimeList News',
    url: 'https://myanimelist.net/rss.php?type=news',
  },
  {
    source: 'Anime News Network',
    url: 'https://www.animenewsnetwork.com/all/rss.xml',
  },
]

const cache = new Map()
const pendingRequests = new Map()

function logCache(message, key) {
  if (isDevelopment) {
    console.info(`[AnimeLoom News] ${message}: ${key}`)
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

function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return 'Unknown Date'
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    })
  } catch {
    return 'Unknown Date'
  }
}

function stripHtml(value) {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractImageFromHtml(html) {
  if (!html) return null

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.querySelector('img')?.src || null
  } catch {
    return null
  }
}

function getTagValue(item, tagName) {
  const elements = item.getElementsByTagName(tagName)
  return elements.length ? elements[0].textContent || '' : ''
}

function parseRssItem(item, fallbackSource) {
  const title = getTagValue(item, 'title') || 'Untitled'
  const rawDescription =
    getTagValue(item, 'description') || getTagValue(item, 'content:encoded') || ''
  const summary = stripHtml(rawDescription)
  const image_url =
    getTagValue(item, 'enclosure') || extractImageFromHtml(rawDescription) || null
  const publishDate =
    getTagValue(item, 'pubDate') || getTagValue(item, 'dc:date') || new Date().toISOString()
  const source = getTagValue(item, 'source') || fallbackSource
  const author =
    getTagValue(item, 'author') || getTagValue(item, 'dc:creator') || ''
  const link =
    item.getElementsByTagName('link')[0]?.textContent || getTagValue(item, 'link') || ''

  return {
    title,
    summary,
    publishDate,
    source,
    link,
    image_url,
    author,
  }
}

async function fetchWithTimeout(url, timeoutMs = 10000, retryIndex = 0, options = {}) {
  const { signal } = options
  const startTime = Date.now()

  const isBrowser = typeof window !== 'undefined'
  if (isBrowser && typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('News data is temporarily unavailable. (Offline)')
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    // Combine external signal and timeout signal
    let combinedSignal = controller.signal
    const onAbort = () => {
      controller.abort()
    }

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId)
        throw new DOMException('The user aborted a request.', 'AbortError')
      }
      signal.addEventListener('abort', onAbort)
    }

    try {
      const response = await fetch(url, {
        signal: combinedSignal,
      })

      const duration = Date.now() - startTime
      trackApiPerformance('News API', url, duration, response.ok ? 'success' : 'failure')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response
    } finally {
      clearTimeout(timeoutId)
      if (signal) {
        signal.removeEventListener('abort', onAbort)
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      if (signal?.aborted) {
        throw error // User cancelled
      }
      throw new Error('News data is temporarily unavailable. (Timeout)', { cause: error })
    }

    const duration = Date.now() - startTime
    trackApiPerformance('News API', url, duration, 'failure')
    if (retryIndex < RETRY_DELAYS.length) {
      await wait(RETRY_DELAYS[retryIndex])
      return fetchWithTimeout(url, timeoutMs, retryIndex + 1, options)
    }

    throw error
  }
}

async function fetchRssFeed(feed, options = {}) {
  const response = await fetchWithTimeout(`${RSS_PROXY_BASE}${encodeURIComponent(feed.url)}`, 10000, 0, options)
  const text = await response.text()
  const document = new DOMParser().parseFromString(text, 'application/xml')

  if (document.querySelector('parsererror')) {
    throw new Error('RSS feed could not be parsed')
  }

  const items = Array.from(document.querySelectorAll('item'))
  if (!items.length) {
    return null
  }

  return items.slice(0, 10).map((item) => parseRssItem(item, feed.source))
}

async function tryFetchRssNews(options = {}) {
  for (const feed of RSS_FEEDS) {
    try {
      const articles = await fetchRssFeed(feed, options)
      if (articles && articles.length > 0) {
        return articles
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error // Propagate cancellation immediately
      }
      if (isDevelopment) {
        console.warn(`[AnimeLoom News] RSS source failed (${feed.source}):`, error.message)
      }
    }
  }

  return null
}

function getMockNewsData() {
  const now = new Date()
  return [
    {
      title: 'New Anime Studio Launches Revolutionary AI-Enhanced Animation',
      summary:
        'A groundbreaking anime studio has unveiled cutting-edge AI technology that assists in the animation process while maintaining artistic integrity. Industry experts believe this could reshape production timelines and costs across the sector.',
      publishDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Anime Industry Weekly',
      link: 'https://example.com/news1',
      image_url:
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60',
      author: 'Editorial Team',
    },
    {
      title: 'Spring Anime Season Breaks All-Time Viewership Records',
      summary:
        'Streaming platforms report unprecedented engagement with this season\'s anime releases. Popular shows are driving significant subscriber growth and international expansion for major streaming services.',
      publishDate: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      source: 'MyAnimeList News',
      link: 'https://example.com/news2',
      image_url:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      author: 'News Correspondent',
    },
    {
      title: 'International Anime Convention Attracts Record Attendance',
      summary:
        'One of the world\'s largest anime conventions draws fans from over 50 countries, setting new attendance records. The event showcased exclusive previews, industry panels, and celebrated anime culture on a global scale.',
      publishDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      source: 'Anime Event Central',
      link: 'https://example.com/news3',
      image_url:
        'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=800&auto=format&fit=crop&q=60',
      author: 'Event Reporter',
    },
    {
      title: 'Voice Acting Academy Opens New Training Program',
      summary:
        'Aspiring voice actors now have access to a comprehensive training program from industry veterans. The curriculum combines traditional techniques with modern digital recording technology for the next generation of anime voice talents.',
      publishDate: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      source: 'Voice Industry Today',
      link: 'https://example.com/news4',
      image_url:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60',
      author: 'Industry Analyst',
    },
  ]
}

function formatArticles(articles) {
  return articles.map((article) => ({
    title: article.title || 'Untitled',
    summary: article.summary || '',
    date: formatDate(article.publishDate || article.pubDate || article.date),
    author: article.author || '',
    source: article.source || 'Anime News',
    url: article.link || article.url || '#',
    image_url: article.image_url || null,
    excerpt:
      article.summary && article.summary.length > 220
        ? `${article.summary.slice(0, 220).trim()}...`
        : article.summary || 'No summary available.',
  }))
}

async function fetchNewsWithRetry(options = {}) {
  const { signal } = options
  const cached = getFromCache(NEWS_CACHE_KEY)
  if (cached) return cached

  let sharedRequest = pendingRequests.get(NEWS_CACHE_KEY)
  if (!sharedRequest) {
    sharedRequest = (async () => {
      try {
        // Run tryFetchRssNews without passing the caller's signal to prevent premature abort
        let articles = await tryFetchRssNews({})

        if (!articles || articles.length === 0) {
          if (isDevelopment) {
            console.info('[AnimeLoom News] Using mock data fallback')
          }
          articles = getMockNewsData()
        }

        const formatted = formatArticles(articles)
        setToCache(NEWS_CACHE_KEY, formatted)
        return formatted
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error
        }
        if (isDevelopment) {
          console.error('[AnimeLoom News] Error:', error)
        }

        try {
          const mockArticles = getMockNewsData()
          const formatted = formatArticles(mockArticles)
          setToCache(NEWS_CACHE_KEY, formatted)
          return formatted
        } catch (fallbackError) {
          if (isDevelopment) {
            console.error('[AnimeLoom News] Critical fallback error:', fallbackError)
          }
          throw new Error('News data is temporarily unavailable.', { cause: fallbackError })
        }
      }
    })()

    pendingRequests.set(NEWS_CACHE_KEY, sharedRequest)
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
    pendingRequests.delete(NEWS_CACHE_KEY)
  }
}

function clearNewsCache() {
  cache.delete(NEWS_CACHE_KEY)
  logCache('Cache Cleared', NEWS_CACHE_KEY)
}

function getCachedNews() {
  return getFromCache(NEWS_CACHE_KEY)
}

export const newsService = {
  fetchNews: fetchNewsWithRetry,
  clearCache: clearNewsCache,
  getCachedNews: getCachedNews,
}
