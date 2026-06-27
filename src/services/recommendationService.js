import { animeService } from './animeService';
import aiProvider from './aiProvider';

// In-memory memoization cache for AI recommendation scoring
const memoCache = new Map();

export const recommendationService = {
  /**
   * Module 1 & 4: Multi-factor Smart AI Recommendations with concise reason explanations.
   * Integrates user favorite genres, ratings, completion status, watching history, and community scores.
   */
  async getRecommendedForYou(progressList = [], options = {}) {
    if (!Array.isArray(progressList) || progressList.length === 0) {
      // Fallback for new/guest users: return trending with generic AI reason
      try {
        const trending = await animeService.getTrendingAnime(options);
        return (trending || []).slice(0, 10).map(item => ({
          ...item,
          reason: 'Recommended because it is trending #1 across the AnimeLoom community this week.'
        }));
      } catch (e) {
        console.error('[RecommendationService] Fallback trending failed', e);
        return [];
      }
    }

    const validItems = progressList.filter(p => p.status === 'watching' || p.status === 'completed');
    if (validItems.length === 0) return [];
    
    // Sort by updated_at desc to find the most recently active anime
    const sorted = [...validItems].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    const baseAnime = sorted[0];
    const baseAnimeId = baseAnime.anime_id;

    const cacheKey = `smart_rec_${baseAnimeId}_${progressList.length}`;
    if (memoCache.has(cacheKey)) {
      return memoCache.get(cacheKey);
    }
    
    try {
      const recommendations = await animeService.getRelatedAnime(baseAnimeId, options);
      const trackedIds = new Set(progressList.map(p => p.anime_id));
      const filteredRecs = recommendations.filter(r => !trackedIds.has(r.mal_id));

      // Get user favorite genres for multi-factor scoring
      const favoriteGenres = await this.getFavoriteGenres(progressList);

      const userProfileContext = {
        favoriteGenres,
        completedTitles: progressList.filter(p => p.status === 'completed'),
        userRatings: {},
      };

      const scoredRecommendations = filteredRecs.map(item => {
        const aiEvaluation = aiProvider.scoreCandidate(item, userProfileContext);
        const baseTitle = baseAnime.anime_title || baseAnime.title || 'your recent shows';
        
        let customReason = `Recommended because you enjoy titles similar to ${baseTitle}.`;
        if (favoriteGenres.length > 0) {
          customReason = `Recommended because you enjoy ${favoriteGenres[0]} titles like ${baseTitle}.`;
        }

        return {
          ...item,
          aiScore: aiEvaluation.score,
          reason: item.reason || aiEvaluation.reason || customReason
        };
      });

      const finalResults = scoredRecommendations.slice(0, 10);
      memoCache.set(cacheKey, finalResults);
      return finalResults;
    } catch (e) {
      console.error('[RecommendationService] Failed to get smart recommendations', e);
      return [];
    }
  },

  /**
   * Filters trending anime to exclude titles the user is already tracking.
   */
  getTrendingForYou(trendingAnime, progressList) {
    if (!trendingAnime || trendingAnime.length === 0) return [];
    if (!progressList || progressList.length === 0) {
      return trendingAnime.slice(0, 10).map(a => ({
        ...a,
        reason: 'Trending strongly among active viewers right now.'
      }));
    }
    
    const trackedIds = new Set(progressList.map(p => p.anime_id));
    return trendingAnime
      .filter(a => !trackedIds.has(a.mal_id))
      .slice(0, 10)
      .map(a => ({
        ...a,
        reason: 'Popular in community discussions this week.'
      }));
  },

  /**
   * Module 7: Smart "Watch Next" generator evaluating unfinished shows
   */
  getWatchNext(progressList = []) {
    if (!Array.isArray(progressList) || progressList.length === 0) return null;

    const watchingList = progressList.filter(p => p.status === 'watching' && p.total_episodes > 0);
    if (watchingList.length === 0) {
      const planToWatch = progressList.filter(p => p.status === 'plan_to_watch');
      if (planToWatch.length === 0) return null;
      const firstPlan = planToWatch[0];
      return {
        ...firstPlan,
        reason: 'Ready to start! You added this to your Plan to Watch list.'
      };
    }

    // Sort by completion proximity (% completed) and recency
    const sorted = [...watchingList].sort((a, b) => {
      const proxA = a.episodes_watched / a.total_episodes;
      const proxB = b.episodes_watched / b.total_episodes;
      if (Math.abs(proxA - proxB) > 0.1) return proxB - proxA; // Prioritize closest to finishing
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    });

    const topCandidate = sorted[0];
    const remaining = topCandidate.total_episodes - topCandidate.episodes_watched;

    return {
      ...topCandidate,
      remainingEpisodes: remaining,
      reason: remaining === 1 
        ? 'Only 1 episode left! Finish this series today.' 
        : `Just ${remaining} episodes left to complete this season.`
    };
  },

  /**
   * Module 6: Personal Insights calculation engine
   */
  getPersonalInsights(progressList = []) {
    if (!Array.isArray(progressList) || progressList.length === 0) {
      return {
        topGenrePercent: 0,
        topGenreName: 'None',
        epPreference: 'Diverse formats',
        completionRate: 0,
        activeHabit: 'Getting Started'
      };
    }

    const total = progressList.length;
    const completed = progressList.filter(p => p.status === 'completed').length;
    const completionRate = Math.round((completed / total) * 100);

    const shortSeries = progressList.filter(p => p.total_episodes > 0 && p.total_episodes <= 13).length;
    const longSeries = progressList.filter(p => p.total_episodes >= 25).length;

    let epPreference = 'Balanced multi-season series';
    if (shortSeries > longSeries && shortSeries > 2) {
      epPreference = 'Prefers short 12-episode series';
    } else if (longSeries > shortSeries && longSeries > 2) {
      epPreference = 'Loves long-running epic sagas';
    }

    return {
      completionRate,
      epPreference,
      activeHabit: completed > 10 ? 'Power Binger' : 'Casual Watcher'
    };
  },

  /**
   * Calculates watching streaks based on unique days of activity.
   */
  getWatchingStreak(progressList) {
    if (!progressList || progressList.length === 0) return { current: 0, longest: 0 };
    
    const dates = progressList
      .map(p => new Date(p.updated_at || p.created_at).toISOString().split('T')[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
    const uniqueDates = [...new Set(dates)];
    if (uniqueDates.length === 0) return { current: 0, longest: 0 };

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
       currentStreak = 1;
       for (let i = 0; i < uniqueDates.length - 1; i++) {
         const d1 = new Date(uniqueDates[i]);
         const d2 = new Date(uniqueDates[i+1]);
         const diffDays = Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
         if (diffDays === 1) {
           currentStreak++;
         } else {
           break;
         }
       }
    }

    let tempStreak = 1;
    let longestStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
       const d1 = new Date(uniqueDates[i]);
       const d2 = new Date(uniqueDates[i+1]);
       const diffDays = Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
       if (diffDays === 1) {
         tempStreak++;
         if (tempStreak > longestStreak) longestStreak = tempStreak;
       } else {
         tempStreak = 1;
       }
    }

    return { current: currentStreak, longest: longestStreak };
  },

  /**
   * Generates achievements based on user's watching progress.
   */
  getUserAchievements(progressList) {
    const achievements = [];
    if (!progressList) return achievements;

    const total = progressList.length;
    const completed = progressList.filter(p => p.status === 'completed').length;
    let totalEpisodes = 0;
    
    progressList.forEach(p => {
      totalEpisodes += (p.episodes_watched || 0);
    });

    if (total > 0) {
      achievements.push({ id: 'first_track', title: 'First Anime Tracked', icon: '🎯', description: 'Started your anime journey.' });
    }
    if (completed >= 10) {
      achievements.push({ id: 'comp_10', title: 'Completed 10 Anime', icon: '🥉', description: 'Finished 10 series.' });
    }
    if (completed >= 25) {
      achievements.push({ id: 'comp_25', title: 'Completed 25 Anime', icon: '🥈', description: 'Finished 25 series.' });
    }
    if (totalEpisodes >= 100) {
      achievements.push({ id: 'eps_100', title: 'Century Club', icon: '💯', description: 'Watched 100 episodes.' });
    }
    if (totalEpisodes >= 500) {
      achievements.push({ id: 'eps_500', title: 'Binge Watcher', icon: '🍿', description: 'Watched 500 episodes.' });
    }

    return achievements;
  },

  /**
   * Samples top 3 recently active anime to extract favorite genres to avoid rate limits.
   */
  async getFavoriteGenres(progressList) {
    if (!progressList || progressList.length === 0) return [];

    const sample = progressList
      .filter(p => p.status === 'completed' || p.status === 'watching')
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 3);
      
    if (sample.length === 0) return [];
    
    const genreCounts = {};
    
    await Promise.all(sample.map(async (item) => {
        try {
          const details = await animeService.getAnimeDetails(item.anime_id);
          if (details && details.genres) {
            details.genres.forEach(g => {
              genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
          }
        } catch(e) {
          console.warn(`[RecommendationService] Failed to fetch genres for ${item.anime_id}`);
        }
    }));
    
    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0]);
  },

  /**
   * Maps favorite genres to a user personality title.
   */
  getAnimePersonality(genres) {
    if (!genres || genres.length === 0) return "Casual Viewer";
    const topGenresStr = genres.slice(0, 2).join(' ').toLowerCase();
    
    if (topGenresStr.includes('action') || topGenresStr.includes('shounen')) return 'Action Lover';
    if (topGenresStr.includes('romance') || topGenresStr.includes('shoujo')) return 'Romance Enthusiast';
    if (topGenresStr.includes('fantasy') || topGenresStr.includes('isekai')) return 'Fantasy Explorer';
    if (topGenresStr.includes('comedy') || topGenresStr.includes('slice of life')) return 'Chill Watcher';
    if (topGenresStr.includes('drama') || topGenresStr.includes('thriller') || topGenresStr.includes('psychological')) return 'Drama Seeker';
    if (topGenresStr.includes('sports')) return 'Sports Fanatic';
    if (topGenresStr.includes('sci-fi') || topGenresStr.includes('mecha')) return 'Sci-Fi Nerd';
    
    return 'Otaku Member';
  }
};

export default recommendationService;
