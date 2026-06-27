import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '../services/reviewService'

/**
 * Encapsulates all review state, sorting, and pagination for an anime.
 * @param {string|number} animeId
 * @param {string|null} currentUserId
 */
export function useReviews(animeId, currentUserId = null) {
  const [reviews, setReviews] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest') // 'newest' | 'top_rated' | 'most_liked'
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [userReview, setUserReview] = useState(null)

  const LIMIT = 10

  const loadReviews = useCallback(async (newSort = sort, newPage = 1, append = false) => {
    if (!animeId) return
    setLoading(true)
    try {
      const [reviewsData, myReview] = await Promise.all([
        reviewService.getReviewsForAnimeSorted(animeId, newSort, newPage, LIMIT),
        newPage === 1 && currentUserId
          ? reviewService.getUserReviewForAnime(currentUserId, animeId)
          : Promise.resolve(undefined),
      ])
      setReviews(prev => append ? [...prev, ...reviewsData.reviews] : reviewsData.reviews)
      setTotalCount(reviewsData.count)
      setHasMore((newPage * LIMIT) < reviewsData.count)
      setPage(newPage)
      if (myReview !== undefined) setUserReview(myReview)
    } catch (err) {
      console.error('[useReviews] Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [animeId, currentUserId, sort])

  useEffect(() => { loadReviews('newest', 1, false) }, [animeId, currentUserId]) // eslint-disable-line

  const changeSort = useCallback((newSort) => {
    setSort(newSort)
    setPage(1)
    loadReviews(newSort, 1, false)
  }, [loadReviews])

  const loadMore = useCallback(() => {
    loadReviews(sort, page + 1, true)
  }, [sort, page, loadReviews])

  const refreshReviews = useCallback(() => {
    loadReviews(sort, 1, false)
  }, [sort, loadReviews])

  return {
    reviews, setReviews,
    totalCount, setTotalCount,
    loading,
    sort, changeSort,
    hasMore,
    loadMore,
    userReview, setUserReview,
    refreshReviews,
  }
}

export default useReviews
