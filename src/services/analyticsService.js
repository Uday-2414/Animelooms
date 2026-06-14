const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || ''
const isBrowser = typeof window !== 'undefined'

function hasGtag() {
  return isBrowser && typeof window.gtag === 'function'
}

function hasVercelTrack() {
  return isBrowser && typeof window.va === 'function'
}

function safeGtag(...args) {
  if (!hasGtag()) return
  window.gtag(...args)
}

function safeVercelTrack(name, data) {
  if (!hasVercelTrack()) return
  try {
    window.va('event', {
      name,
      data,
    })
  } catch {
    // Swallow runtime errors from invalid Vercel Analytics payloads.
  }
}

export const initAnalytics = () => {
  if (!isBrowser) return
  if (!GA_MEASUREMENT_ID) {
    if (import.meta.env.DEV) {
      console.info('[Analytics] VITE_GOOGLE_ANALYTICS_ID is not configured.')
    }
    return
  }

  if (hasGtag()) return

  window.dataLayer = window.dataLayer || []

  function gtag() {
    window.dataLayer.push(arguments)
  }

  window.gtag = gtag

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  })

  if (import.meta.env.DEV) {
    console.info('[Analytics] Google Analytics initialized:', GA_MEASUREMENT_ID)
  }
}

export const trackPageView = (pagePath, pageTitle = '') => {
  if (!isBrowser) return

  const trimmedPath = String(pagePath || window.location.pathname)
  const payload = {
    page_path: trimmedPath,
    page_title: pageTitle || document.title,
  }

  if (hasGtag()) {
    safeGtag('event', 'page_view', payload)
  }

  if (import.meta.env.DEV) {
    console.debug('[Analytics] trackPageView', payload)
  }
}

export const trackEvent = (eventName, eventData = {}) => {
  if (!isBrowser) return

  if (hasGtag()) {
    safeGtag('event', eventName, eventData)
  }

  safeVercelTrack(eventName, eventData)

  if (import.meta.env.DEV) {
    console.debug('[Analytics] trackEvent', eventName, eventData)
  }
}

export const trackSearch = (searchTerm) => {
  if (!searchTerm) return
  trackEvent('anime_search', {
    search_term: String(searchTerm),
  })
}

export const trackAnimeView = ({ mal_id, title, score }) => {
  if (!mal_id) return

  trackEvent('anime_view', {
    anime_id: String(mal_id),
    anime_title: title || '',
    score: typeof score === 'number' ? score : null,
  })
}

export const trackWatchlistAdd = (animeId, animeTitle, status) => {
  if (!animeId) return
  trackEvent('watchlist_add', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
    status: status || '',
  })
}

export const trackWatchlistRemove = (animeId, animeTitle, status) => {
  if (!animeId) return
  trackEvent('watchlist_remove', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
    status: status || '',
  })
}

export const trackLogin = (provider = 'google') => {
  trackEvent('login', {
    provider,
  })
}

export const trackLogout = (provider = 'google') => {
  trackEvent('logout', {
    provider,
  })
}

export const trackApiPerformance = (
  service,
  endpoint,
  durationMs,
  status = 'success'
) => {
  if (!service || typeof durationMs !== 'number') return

  const payload = {
    service,
    endpoint: endpoint || '',
    duration_ms: Math.round(durationMs),
    status,
    slow: durationMs > 2000,
  }

  if (durationMs > 2000 && import.meta.env.DEV) {
    console.warn('[Analytics] slow API call detected', payload)
  }

  trackEvent('api_performance', payload)
}

export const trackError = (errorMessage, context = '') => {
  if (!errorMessage) return
  trackEvent('app_error', {
    error_message: String(errorMessage),
    context,
  })
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackSearch,
  trackAnimeView,
  trackWatchlistAdd,
  trackWatchlistRemove,
  trackLogin,
  trackLogout,
  trackApiPerformance,
  trackError,
}
