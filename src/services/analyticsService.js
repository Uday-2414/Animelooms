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

export const trackProgressAdd = (animeId, animeTitle, status) => {
  if (!animeId) return
  trackEvent('progress_add', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
    status: status || '',
  })
}

export const trackProgressUpdate = (animeId, animeTitle, episodesWatched) => {
  if (!animeId) return
  trackEvent('progress_update', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
    episodes_watched: Number(episodesWatched),
  })
}

export const trackAnimeCompleted = (animeId, animeTitle) => {
  if (!animeId) return
  trackEvent('anime_completed', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
  })
}

export const trackStatusChanged = (animeId, animeTitle, oldStatus, newStatus) => {
  if (!animeId) return
  trackEvent('status_changed', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
    old_status: oldStatus || '',
    new_status: newStatus || '',
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

export const trackRecommendationClick = (animeId, animeTitle, source) => {
  if (!animeId) return
  trackEvent('recommendation_click', {
    anime_id: String(animeId),
    anime_title: animeTitle || '',
    source: source || 'unknown',
  })
}

export const trackRecommendationView = (source) => {
  trackEvent('recommendation_view', {
    source: source || 'unknown',
  })
}

export const trackDashboardVisit = () => {
  trackEvent('dashboard_visit', {})
}

export const trackAchievementUnlock = (achievementId, achievementTitle) => {
  if (!achievementId) return
  trackEvent('achievement_unlock', {
    achievement_id: achievementId,
    achievement_title: achievementTitle || '',
  })
}

export const trackGenrePreference = (genre) => {
  if (!genre) return
  trackEvent('genre_preference', {
    genre: genre,
  })
}

export const trackError = (errorMessage, context = '') => {
  if (!errorMessage) return
  trackEvent('app_error', {
    error_message: String(errorMessage),
    context,
  })
}


export const trackReviewCreated = (animeId, rating) => {
  if (!animeId) return
  trackEvent('review_created', {
    anime_id: String(animeId),
    rating: Number(rating)
  })
}

export const trackReviewUpdated = (animeId, rating) => {
  if (!animeId) return
  trackEvent('review_updated', {
    anime_id: String(animeId),
    rating: Number(rating)
  })
}

export const trackReviewDeleted = (animeId) => {
  if (!animeId) return
  trackEvent('review_deleted', {
    anime_id: String(animeId)
  })
}

export const trackAnimeRated = (animeId, rating) => {
  if (!animeId) return
  trackEvent('anime_rated', {
    anime_id: String(animeId),
    rating: Number(rating)
  })
}

export const trackReviewLiked = (reviewId) => {
  if (!reviewId) return
  trackEvent('review_liked', {
    review_id: String(reviewId)
  })
}

export const trackProfileViewed = (profileUserId) => {
  if (!profileUserId) return
  trackEvent('profile_viewed', { profile_user_id: String(profileUserId) })
}

export const trackActivityViewed = (source = 'community') => {
  trackEvent('activity_viewed', { source })
}

export const trackReviewSorted = (animeId, sort) => {
  if (!animeId) return
  trackEvent('review_sorted', { anime_id: String(animeId), sort: sort || 'newest' })
}

export const trackSpoilerToggle = (reviewId) => {
  if (!reviewId) return
  trackEvent('spoiler_toggled', { review_id: String(reviewId) })
}

export const trackReviewReported = (reviewId) => {
  if (!reviewId) return
  trackEvent('review_reported', { review_id: String(reviewId) })
}

export const trackXPEarned = (source, amount, totalXP) => {
  trackEvent('xp_earned', { source, amount: Number(amount), total_xp: Number(totalXP) })
}

export const trackLevelUp = (newLevel, totalXP) => {
  trackEvent('level_up', { level: Number(newLevel), total_xp: Number(totalXP) })
}

export const trackAchievementUnlocked = (achievementId, title) => {
  if (!achievementId) return
  trackEvent('achievement_unlocked', { achievement_id: achievementId, title: title || '' })
}

export const trackBadgeEarned = (badgeId) => {
  if (!badgeId) return
  trackEvent('badge_earned', { badge_id: badgeId })
}

export const trackChallengeCompleted = (challengeId, title) => {
  if (!challengeId) return
  trackEvent('challenge_completed', { challenge_id: challengeId, title: title || '' })
}

export const trackStreakContinued = (streakDays) => {
  trackEvent('streak_continued', { streak_days: Number(streakDays) })
}

export const trackNotificationRead = (type) => {
  trackEvent('notification_read', { type: type || 'unknown' })
}

export const trackNaturalSearch = (rawQuery, intentsCount) => {
  trackEvent('natural_search', { query: rawQuery, intents_count: Number(intentsCount) })
}

export const trackDiscoverVisit = () => {
  trackEvent('discover_visit', {})
}

export const trackWatchNextClick = (animeId, animeTitle) => {
  if (!animeId) return
  trackEvent('watch_next_click', { anime_id: String(animeId), anime_title: animeTitle || '' })
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackSearch,
  trackAnimeView,
  trackWatchlistAdd,
  trackWatchlistRemove,
  trackProgressAdd,
  trackProgressUpdate,
  trackAnimeCompleted,
  trackStatusChanged,
  trackLogin,
  trackLogout,
  trackApiPerformance,
  trackError,
  trackRecommendationClick,
  trackRecommendationView,
  trackDashboardVisit,
  trackAchievementUnlock,
  trackGenrePreference,
  trackReviewCreated,
  trackReviewUpdated,
  trackReviewDeleted,
  trackAnimeRated,
  trackReviewLiked,
  trackProfileViewed,
  trackActivityViewed,
  trackReviewSorted,
  trackSpoilerToggle,
  trackReviewReported,
  trackXPEarned,
  trackLevelUp,
  trackAchievementUnlocked,
  trackBadgeEarned,
  trackChallengeCompleted,
  trackStreakContinued,
  trackNotificationRead,
}

