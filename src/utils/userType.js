/**
 * User Dashboard Types enumeration
 */
export const USER_TYPES = {
  LOADING: 'LOADING',
  GUEST: 'GUEST',
  NEW_USER: 'NEW_USER',
  RETURNING_USER: 'RETURNING_USER',
}

/**
 * Determines the dashboard user state based on auth status and progress data.
 * 
 * @param {Object} params
 * @param {Object|null} params.user - Authenticated Supabase user
 * @param {Array} params.progressList - User's watchlist/progress items
 * @param {boolean} params.authLoading - AuthContext loading status
 * @param {boolean} params.progressLoading - Progress query loading status
 * @returns {string} One of USER_TYPES
 */
export function determineDashboardType({ user, progressList, authLoading, progressLoading }) {
  if (authLoading || (user && progressLoading)) {
    return USER_TYPES.LOADING
  }

  if (!user) {
    return USER_TYPES.GUEST
  }

  if (Array.isArray(progressList) && progressList.length > 0) {
    return USER_TYPES.RETURNING_USER
  }

  return USER_TYPES.NEW_USER
}
