/**
 * Analytics utility for tracking user events and page views
 * Integrates with Google Analytics and Microsoft Clarity
 * 
 * PRODUCTION: Set actual IDs in environment variables
 * DEVELOPMENT: Logs events to console
 */

// Configuration - Update with actual IDs in production
const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || null
const MICROSOFT_CLARITY_ID = import.meta.env.VITE_MICROSOFT_CLARITY_ID || null

const isDevelopment = import.meta.env.DEV

/**
 * Initialize analytics services
 * Call this in main.jsx after app initialization
 */
export const initializeAnalytics = () => {
  // Google Analytics
  if (GOOGLE_ANALYTICS_ID) {
    loadGoogleAnalytics(GOOGLE_ANALYTICS_ID)
  } else if (isDevelopment) {
    console.log('ℹ️ Google Analytics not configured (set VITE_GOOGLE_ANALYTICS_ID)')
  }

  // Microsoft Clarity
  if (MICROSOFT_CLARITY_ID) {
    loadMicrosoftClarity(MICROSOFT_CLARITY_ID)
  } else if (isDevelopment) {
    console.log('ℹ️ Microsoft Clarity not configured (set VITE_MICROSOFT_CLARITY_ID)')
  }
}

/**
 * Load Google Analytics
 */
const loadGoogleAnalytics = (gaId) => {
  try {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', gaId, {
      page_path: window.location.pathname,
    })

    if (isDevelopment) {
      console.log('✓ Google Analytics loaded:', gaId)
    }
  } catch (error) {
    console.error('Failed to load Google Analytics:', error)
  }
}

/**
 * Load Microsoft Clarity
 */
const loadMicrosoftClarity = (clarityId) => {
  try {
    window.clarity =
      window.clarity ||
      function () {
        ;(window.clarity.q = window.clarity.q || []).push(arguments)
      }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.clarity.ms/tag/${clarityId}`
    document.head.appendChild(script)

    if (isDevelopment) {
      console.log('✓ Microsoft Clarity loaded:', clarityId)
    }
  } catch (error) {
    console.error('Failed to load Microsoft Clarity:', error)
  }
}

/**
 * Track page view
 * @param {string} pageName - Name of the page (e.g., 'home', 'search', 'watchlist')
 * @param {string} pageTitle - Title of the page
 */
export const trackPageView = (pageName, pageTitle = '') => {
  if (isDevelopment) {
    console.log(`📊 Page view: ${pageName} - ${pageTitle}`)
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_title: pageTitle || document.title,
    })
  }

  // Microsoft Clarity
  if (window.clarity) {
    window.clarity('set', 'pageTitle', pageTitle || document.title)
  }
}

/**
 * Track custom event
 * @param {string} eventName - Name of the event (e.g., 'add_to_watchlist', 'search_anime')
 * @param {object} eventData - Event properties
 */
export const trackEvent = (eventName, eventData = {}) => {
  if (isDevelopment) {
    console.log(`📊 Event: ${eventName}`, eventData)
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, eventData)
  }

  // Microsoft Clarity
  if (window.clarity) {
    window.clarity('event', eventName, eventData)
  }
}

/**
 * Track user signup
 */
export const trackSignup = (provider = 'google') => {
  trackEvent('sign_up', {
    method: provider,
  })
}

/**
 * Track user login
 */
export const trackLogin = (provider = 'google') => {
  trackEvent('login', {
    method: provider,
  })
}

/**
 * Track anime search
 */
export const trackSearch = (query) => {
  trackEvent('search', {
    search_term: query,
  })
}

/**
 * Track anime added to watchlist
 */
export const trackAddToWatchlist = (animeId, animeName) => {
  trackEvent('add_to_watchlist', {
    anime_id: animeId,
    anime_name: animeName,
  })
}

/**
 * Track anime removed from watchlist
 */
export const trackRemoveFromWatchlist = (animeId, animeName) => {
  trackEvent('remove_from_watchlist', {
    anime_id: animeId,
    anime_name: animeName,
  })
}

/**
 * Track anime details view
 */
export const trackAnimeDetailsView = (animeId, animeName) => {
  trackEvent('view_anime_details', {
    anime_id: animeId,
    anime_name: animeName,
  })
}

/**
 * Track error event
 */
export const trackError = (errorMessage, context = '') => {
  trackEvent('error', {
    error_message: errorMessage,
    context: context,
  })
}

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackSignup,
  trackLogin,
  trackSearch,
  trackAddToWatchlist,
  trackRemoveFromWatchlist,
  trackAnimeDetailsView,
  trackError,
}
