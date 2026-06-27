import { supabase } from './supabaseClient'

export const moderationService = {
  /**
   * Submits a report for a review.
   * Users can only report a review once (unique constraint on review_id + reporter_id).
   */
  async reportReview(userId, reviewId, reason) {
    if (!userId || !reviewId || !reason) {
      throw new Error('Missing required fields for review report')
    }

    const { error } = await supabase.from('review_reports').insert({
      review_id: reviewId,
      reporter_id: userId,
      reason: reason.trim().slice(0, 500),
    })

    if (error) {
      // Code 23505 = unique violation = already reported
      if (error.code === '23505') {
        throw new Error('already_reported')
      }
      console.error('[ModerationService] Error reporting review:', error.message)
      throw error
    }

    return true
  },
}

export default moderationService
