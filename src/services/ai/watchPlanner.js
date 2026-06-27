/**
 * AI Watch Planner
 * 
 * Analyzes a user's tracking list to suggest the immediate "Next Watch".
 */

export const watchPlanner = {
  /**
   * Evaluates the progress list and returns an array of priority watch recommendations.
   * Priority:
   * 1. Currently watching (needs to finish)
   * 2. Plan to watch (highly rated ones first)
   * 3. On Hold (give it another chance)
   */
  getWatchNext(progressList = []) {
    if (!progressList || progressList.length === 0) return []

    const currentlyWatching = progressList
      .filter(p => p.status === 'watching')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

    const planToWatch = progressList
      .filter(p => p.status === 'plan_to_watch')
      // Sort by creation date (newest addition first)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const onHold = progressList
      .filter(p => p.status === 'on_hold')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

    // Combine them into a priority queue
    const suggestions = []
    
    // Suggest the top 2 things they are currently watching
    if (currentlyWatching.length > 0) suggestions.push(...currentlyWatching.slice(0, 2))
    
    // Suggest the top 1 thing they planned to watch
    if (planToWatch.length > 0) suggestions.push(planToWatch[0])
    
    // Suggest 1 thing on hold to pick back up
    if (onHold.length > 0) suggestions.push(onHold[0])
    
    // Fill the rest with watching if available
    if (suggestions.length < 5 && currentlyWatching.length > 2) {
      suggestions.push(...currentlyWatching.slice(2, 5 - suggestions.length + 2))
    }

    return suggestions.map(item => ({
      ...item,
      explanation: this._generatePlannerExplanation(item.status, item.episodes_watched)
    }))
  },

  _generatePlannerExplanation(status, epsWatched) {
    if (status === 'watching') {
      return epsWatched > 0 
        ? `Pick up from Episode ${epsWatched + 1}.` 
        : 'You just started this. Keep going!'
    }
    if (status === 'plan_to_watch') {
      return 'You added this to your list recently. Time to start!'
    }
    if (status === 'on_hold') {
      return 'Give this another chance.'
    }
    return 'Next on your list.'
  }
}
