/**
 * AI Personal Insights Generator
 * 
 * Analyzes the user's progress list to extract actionable insights.
 */

export const insightGenerator = {
  
  /**
   * Generates a comprehensive insights object from a progress list.
   */
  async generateInsights(progressList = []) {
    if (!progressList || progressList.length === 0) return null

    const completed = progressList.filter(p => p.status === 'completed')
    const totalRated = progressList.filter(p => p.score > 0)
    
    // 1. Calculate Average Score
    let avgScore = 0
    if (totalRated.length > 0) {
      const sum = totalRated.reduce((acc, curr) => acc + curr.score, 0)
      avgScore = (sum / totalRated.length).toFixed(1)
    }

    // 2. Calculate Completion Rate
    const completionRate = progressList.length > 0 
      ? Math.round((completed.length / progressList.length) * 100) 
      : 0

    // 3. To find Most Watched Genre/Studio, we unfortunately need the anime metadata.
    // In a real DB, we'd join this. Here, we rely on the fact that progressList only stores ID/Title/Image.
    // For a production app without a full DB clone, we would fetch details for the top N completed anime,
    // or rely on a backend sync. 
    // For this RC-2 milestone, we will use mock/derived heuristics if we can't fetch them all.
    
    // Because we cannot spam Jikan with 100 requests to get genres of completed anime, 
    // we'll return the structural insights that are immediately available, and leave 
    // the heavy "Most active genre" to the backend / recommendationService that caches favorite genres.
    
    let preferredLength = 'Standard (12-24 eps)'
    const totalEps = progressList.reduce((acc, p) => acc + (p.episodes_watched || 0), 0)
    if (completed.length > 0) {
       const epsPerAnime = totalEps / progressList.length
       if (epsPerAnime < 14) preferredLength = 'Short (< 14 eps)'
       else if (epsPerAnime > 50) preferredLength = 'Long Shonen (50+ eps)'
    }

    return {
      averageScore: avgScore,
      completionRate: completionRate,
      preferredLength: preferredLength,
      totalEpsWatched: totalEps,
      ratingHarshness: avgScore == 0 ? 'Unrated' : avgScore > 8 ? 'Generous' : avgScore < 6 ? 'Critical' : 'Fair'
    }
  }
}
